import { prisma } from '@abge/database';

async function main() {
  const v = await prisma.brandDNAVersion.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(v, null, 2));
}

main().finally(() => prisma.$disconnect());
