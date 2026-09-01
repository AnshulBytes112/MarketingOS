import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  const dna = await prisma.brandDNAVersion.findFirst({ where: { publicationStatus: 'ACTIVE' } }); 
  console.log('DNA:', dna?.personality); 
  const products = await prisma.brandProduct.findMany(); 
  console.log('Products:', products.map(p => p.name)); 
  const competitors = await prisma.brandCompetitor.findMany(); 
  console.log('Competitors:', competitors.map(c => c.name)); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
