import { prisma } from './src/client';
async function main() {
  const brands = await prisma.brand.findMany();
  console.log('Brands:', brands.map(b => ({ id: b.id, name: b.name, organizationId: b.organizationId })));

  const plans = await prisma.contentPlan.findMany();
  console.log('Content Plans:', plans.map(p => ({ id: p.id, name: p.name, status: p.status, organizationId: p.organizationId, brandId: p.brandId })));

  const items = await prisma.contentItem.findMany({
    take: 5
  });
  console.log('Sample Content Items:', items.map(i => ({ id: i.id, title: i.title, organizationId: i.organizationId, brandId: i.brandId, contentPlanId: i.contentPlanId })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
