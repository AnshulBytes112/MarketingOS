import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { generateTotpSecret, encryptTotpSecret } from '../packages/auth/src/totp'

dotenv.config()

async function main() {
  const email = 'admin@aibrandos.com'
  const rawPassword = 'superpassword123'
  const passwordHash = await bcrypt.hash(rawPassword, 10)
  
  const rawTotpSecret = generateTotpSecret()
  const encryptedSecret = encryptTotpSecret(rawTotpSecret)

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const result = await pool.query('SELECT id FROM "PlatformAdmin" WHERE email = $1', [email]);
  if (result.rows.length > 0) {
    await pool.query(
      'UPDATE "PlatformAdmin" SET "passwordHash" = $1, "totpSecret" = $2, role = $3 WHERE email = $4',
      [passwordHash, encryptedSecret, 'OWNER', email]
    );
  } else {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO "PlatformAdmin" (id, email, name, "passwordHash", "totpSecret", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
      [id, email, 'Super Admin', passwordHash, encryptedSecret, 'OWNER']
    );
  }

  console.log('====================================')
  console.log('Super Admin successfully created & persisted in DB!')
  console.log('Email:', email)
  console.log('Password:', rawPassword)
  console.log('TOTP Secret:', rawTotpSecret)
  console.log('====================================')
  
  await pool.end();
}

main().catch(console.error);