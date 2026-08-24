import { prisma } from '@abge/database';

async function main() {
  const brand = await prisma.brand.findFirst();
  if (!brand) return console.log('No brand found');

  await prisma.brandDNAVersion.create({
    data: {
      organizationId: brand.organizationId,
      brandId: brand.id,
      version: 99,
      status: 'COMPLETED',
      confidenceScore: 0.95,
      sources: ['qa-test'],
      personality: "Innovative and reliable QA",
      voice: "Professional",
      tone: "Confident",
      visualIdentitySummary: "Sleek and modern",
      audience: "QA Engineers",
    }
  });

  console.log('Injected COMPLETED DNA version');
  await prisma.$disconnect();
}

main().catch(console.error);
