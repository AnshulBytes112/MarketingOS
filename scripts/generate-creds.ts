import { generateTotpSecret, encryptTotpSecret, generateTotpUri } from '../packages/auth/src/totp';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

async function run() {
  const email = 'admin@aibrandos.com';
  const password = 'superpassword123';
  const hash = await bcrypt.hash(password, 10);
  const secret = generateTotpSecret();
  const uri = generateTotpUri(secret, email);
  
  const encryptedSecret = encryptTotpSecret(secret);
  
  console.log('\n--- CREDENTIALS ---');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('TOTP Secret:', secret);
  console.log('Authenticator URI:', uri);
  
  console.log('\n--- SQL TO INSERT MANUALLY (Since DB is down) ---');
  console.log(`INSERT INTO "PlatformAdmin" (id, email, name, "passwordHash", "totpSecret", role, "createdAt", "updatedAt") `);
  console.log(`VALUES ('${crypto.randomUUID()}', '${email}', 'Super Admin', '${hash}', '${encryptedSecret}', 'OWNER', NOW(), NOW());`);
}
run();
