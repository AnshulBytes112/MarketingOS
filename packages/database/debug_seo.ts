import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const genId = 'cmtgafi84000s6stlqy7gyml7';
  console.log(`Looking for ContentGeneration: ${genId}`);
  const gen = await p.contentGeneration.findUnique({ where: { id: genId } });
  
  if (!gen) {
    console.log('ContentGeneration not found!');
    return;
  }
  
  console.log(`Found ContentGeneration. contentItemId: ${gen.contentItemId}`);
  
  const item = await p.contentItem.findUnique({ where: { id: gen.contentItemId } });
  if (!item) {
    console.log(`WARNING: ContentItem ${gen.contentItemId} DOES NOT EXIST!`);
  } else {
    console.log(`ContentItem ${gen.contentItemId} exists!`);
    
    // Let's try creating an SEO analysis
    console.log('Attempting to create SEOAnalysis...');
    try {
      const analysis = await p.sEOAnalysis.create({
        data: {
          organizationId: gen.organizationId,
          brandId: gen.brandId,
          contentItemId: gen.contentItemId,
          contentVersionId: gen.id,
          status: 'ANALYZING'
        }
      });
      console.log('Successfully created SEOAnalysis:', analysis.id);
    } catch (e: any) {
      console.log('Failed to create SEOAnalysis:', e.message);
    }
  }
}

main().finally(() => p.$disconnect());
