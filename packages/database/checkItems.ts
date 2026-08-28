import { prisma } from './src/client'; 
async function main() { 
  const items = await prisma.contentItem.findMany({ select: { id: true, title: true, scheduledDate: true } }); 
  console.log(items); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
