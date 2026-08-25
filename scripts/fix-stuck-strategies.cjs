// Check and fix stuck GENERATING strategies
// Env already injected by `dotenvx run --`
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  // Find all stuck in GENERATING
  const generating = await prisma.strategy.findMany({
    where: { status: 'GENERATING' },
    select: { id: true, status: true, brandId: true, createdAt: true },
  });
  console.log('Stuck in GENERATING:', JSON.stringify(generating, null, 2));

  if (generating.length > 0) {
    // Reset them to FAILED so the UI unlocks and new generation can proceed
    const result = await prisma.strategy.updateMany({
      where: { status: 'GENERATING' },
      data: { status: 'FAILED', completedAt: new Date() },
    });
    console.log(`Reset ${result.count} stuck strategy record(s) to FAILED.`);
  }

  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
