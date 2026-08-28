import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  await prisma.brandProduct.deleteMany(); 
  await prisma.brandCompetitor.deleteMany(); 
  await prisma.competitorAccount.deleteMany(); 
  await prisma.brandDNAVersion.deleteMany(); 
  await prisma.strategy.deleteMany(); 
  console.log('Cleaned up old coffee mock data!'); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
