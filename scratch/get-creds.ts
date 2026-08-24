import { decryptTotpSecret } from '@abge/auth';
import { prisma } from '@abge/database';
import { authenticator } from 'otplib';

async function run() {
  const admin = await prisma.platformAdmin.findUnique({ where: { email: 'admin@aibrandos.com' }});
  if (!admin || !admin.totpSecret) {
    console.error('Admin not found or no TOTP secret!');
    return;
  }
  
  const secret = decryptTotpSecret(admin.totpSecret);
  console.log('--- SUPER ADMIN CREDENTIALS ---');
  console.log('Email: admin@aibrandos.com');
  console.log('Password: superpassword123');
  console.log('TOTP Secret:', secret);
  console.log('Current TOTP Code:', authenticator.generate(secret));
  
  const uri = authenticator.keyuri(admin.email, 'AI Brand Growth Engine', secret);
  console.log('Authenticator URI:', uri);
}

run().finally(() => prisma.$disconnect());
