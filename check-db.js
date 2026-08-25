const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const plans = await prisma.contentPlan.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  console.log('Plans:', plans);
  const usages = await prisma.aIUsage.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  console.log('Usages:', usages);
  process.exit(0);
}
run();
