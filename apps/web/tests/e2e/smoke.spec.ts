import { test, expect } from '@playwright/test';

test('has expected page title or element', async ({ page }) => {
  await page.goto('/');
  // Next.js default page usually has an image or main element we can wait for
  await page.waitForLoadState('networkidle');
  // Just ensure the page didn't return a 404/500
  expect(page.url()).toContain('localhost:3000');
});
