const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const plan = await prisma.contentPlan.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!plan) { console.log('No plan'); return; }
  console.log('Latest plan:', plan.id);
  const items = await prisma.contentItem.findMany({ where: { contentPlanId: plan.id } });
  console.log('Found items:', items.length);
  items.forEach(i => console.log(i.scheduledDate.toISOString(), i.title));
}
main().catch(console.error).finally(() => prisma.$disconnect());


