import { prisma } from './src/client';

async function main() {
  const res = await prisma.sEOAnalysis.updateMany({
    where: { status: 'ANALYZING' },
    data: { status: 'FAILED' }
  });
  console.log('Reset:', res);
}

main().finally(() => prisma.$disconnect());
