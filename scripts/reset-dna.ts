import { prisma } from '../packages/database/src/client';



async function main() {
  const result = await prisma.brandDNAVersion.updateMany({
    where: { status: 'GENERATING' },
    data: { status: 'FAILED' }
  });
  console.log(`Reset ${result.count} stuck Brand DNA records from GENERATING to FAILED.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
