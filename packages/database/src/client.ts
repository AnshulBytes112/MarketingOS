import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // fallback

const connectionString = process.env.DATABASE_URL || '';
console.log('DB URL loaded:', !!connectionString);
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export function recreatePrismaClient() {
  console.log('[Prisma Client] Instantiating fallback database client with driver adapter');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const newClient = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = newClient;
  return newClient;
}

export const prisma = (() => {
  const client = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  // If the cached client does not have the new marketInsight model, create a new one
  if (!('marketInsight' in client)) {
    console.log('[Prisma Client] Recreating client to support newly migrated Market Intelligence models');
    return recreatePrismaClient();
  }
  return client;
})();
