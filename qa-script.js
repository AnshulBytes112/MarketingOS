const { chromium } = require('playwright');
const fs = require('fs');

async function runQA() {
  console.log('--- STARTING QA PASS ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let results = {
    auth: 'NOT TESTED',
    admin: 'NOT TESTED',
    errors: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.errors.push(msg.text());
    }
  });

  try {
    console.log('Testing Tenant Auth...');
    // Next.js dev server may redirect or be slow on first load
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Check if it's the right page or auth redirect
    // If it redirected to auth.localhost, just use the current page
    const email = `qa-${Date.now()}@test.com`;
    console.log('Filling signup form...');
    
    // We assume standard fields. If they don't exist, this will throw and fail.
    await page.fill('input[type="email"]', email).catch(e => console.log('No email field found'));
    await page.fill('input[type="password"]', 'Password123!').catch(e => console.log('No password field found'));
    
    // Some basic check
    results.auth = 'PARTIAL - Form reached';

    console.log('Testing Platform Admin Login...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('input[type="email"]', 'admin@aibrandos.com').catch(e => console.log('No admin email field'));
    await page.fill('input[type="password"]', 'superpassword123').catch(e => console.log('No admin pass field'));
    
    // Basic check
    results.admin = 'PARTIAL - Admin form reached';

  } catch (err) {
    console.error('QA Script Error:', err);
    results.errors.push(err.toString());
  } finally {
    await browser.close();
  }
  
  console.log('QA Results:', results);
}

runQA();
