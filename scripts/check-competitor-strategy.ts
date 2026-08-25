import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const competitorId = 'cmt8dvh7p0004bwtluuawbitf';
  console.log(`Checking competitor: ${competitorId}`);
  
  const competitor = await prisma.brandCompetitor.findUnique({
    where: { id: competitorId },
    include: {
      brand: {
        include: {
          strategies: true,
        }
      }
    }
  });

  if (!competitor) {
    console.log('Competitor not found in database.');
    return;
  }

  console.log('Competitor Name:', competitor.name);
  console.log('Brand ID:', competitor.brandId);
  console.log('Brand Name:', competitor.brand.name);
  console.log('Brand Strategies count:', competitor.brand.strategies.length);
  
  for (const s of competitor.brand.strategies) {
    console.log(`Strategy: ID=${s.id}, publicationStatus=${s.publicationStatus}, approvalStatus=${s.approvalStatus}`);
  }
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
  pool.end();
});
