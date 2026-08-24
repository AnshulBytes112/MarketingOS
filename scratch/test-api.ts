import { prisma } from '@abge/database';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const session = await prisma.session.findFirst({
    orderBy: { expiresAt: 'desc' },
    include: { organization: true, user: true }
  });
  
  if (!session) {
    console.log('No session found');
    return;
  }
  
  const brand = await prisma.brand.findFirst();
  if (!brand) {
    console.log('No brand found');
    return;
  }
  
  const reqBody = {
    brandId: brand.id,
    filename: 'test.pdf',
    contentType: 'application/pdf',
    fileSize: 1024,
  };
  
  console.log('Using session token:', session.sessionToken);
  console.log('Using active org:', session.activeOrganizationId);
  console.log('Brand ID:', brand.id);
  
  try {
    const res = await fetch('http://localhost:3000/api/assets/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `abge_session=${session.sessionToken}`
      },
      body: JSON.stringify(reqBody)
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main().finally(() => prisma.$disconnect());
