import { prisma } from './src/client';
async function main() {
  const analyses = await prisma.sEOAnalysis.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('SEO Analyses:', analyses.map(a => ({
    id: a.id,
    contentItemId: a.contentItemId,
    contentVersionId: a.contentVersionId,
    status: a.status,
    seoScore: a.seoScore,
    createdAt: a.createdAt
  })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
