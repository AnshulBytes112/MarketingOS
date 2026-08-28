import { prisma } from './src/client'; 
async function main() { 
  await prisma.brand.updateMany({ 
    data: { 
      industry: '', 
      websiteUrl: '', 
      targetAudience: '', 
      geography: '', 
      priceSegment: '', 
      positioning: '', 
      usp: '' 
    } 
  }); 
  console.log('Brand data cleared'); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
