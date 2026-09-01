import { prisma } from './src/client'; 
async function main() { 
  const items = await prisma.contentItem.findMany({ orderBy: { scheduledDate: 'asc' } }); 
  if (items.length === 0) return;
  const today = new Date();
  
  for (let i = 0; i < items.length; i++) {
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + i + 1); // Starting tomorrow, 1 item per day
    await prisma.contentItem.update({
      where: { id: items[i].id },
      data: { scheduledDate: newDate }
    });
  }
  console.log(`Updated dates for ${items.length} items to start from tomorrow.`); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
