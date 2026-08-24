const { prisma } = require('./packages/database/src/client');

async function main() {
  const result = await prisma.brandDNAVersion.updateMany({
    where: { status: 'GENERATING' },
    data: { status: 'FAILED' }
  });
  console.log('Reset versions:', result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
