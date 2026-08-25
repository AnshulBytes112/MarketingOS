import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@aibrandos.com'
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || 'superpassword123'
  const passwordHash = await bcrypt.hash(rawPassword, 10)
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const result = await pool.query('SELECT id FROM "PlatformAdmin" WHERE email = $1', [email]);
  
  if (result.rows.length > 0) {
    await pool.query(
      'UPDATE "PlatformAdmin" SET "passwordHash" = $1, "totpSecret" = NULL, role = $3 WHERE email = $4',
      [passwordHash, null, 'OWNER', email]
    );
  } else {
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO "PlatformAdmin" (id, email, name, "passwordHash", "totpSecret", role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NULL, $5, NOW(), NOW())',
      [id, email, 'Super Admin', passwordHash, 'OWNER']
    );
  }

  console.log('====================================');
  console.log('Super Admin successfully created & persisted in DB!');
  console.log('Email:', email);
  console.log('Password:', rawPassword);
  console.log('====================================');
  
  await pool.end();
}

main().catch(console.error);