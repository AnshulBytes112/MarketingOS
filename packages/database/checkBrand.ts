import { prisma } from './src/client'; 
async function main() { 
  const brand = await prisma.brand.findFirst(); 
  console.log(brand); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
