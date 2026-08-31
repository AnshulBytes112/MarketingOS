const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../../.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const deleted = await prisma.marketIntelligenceRun.deleteMany({
    where: { status: 'NOT_CONFIGURED' }
  });
  console.log(`Deleted ${deleted.count} old NOT_CONFIGURED runs`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
