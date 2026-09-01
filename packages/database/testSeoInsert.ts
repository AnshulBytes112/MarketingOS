import { prisma } from './src/client';
async function main() {
  try {
    const analysis = await prisma.sEOAnalysis.create({
      data: {
        organizationId: 'cmtbqfx2n0001uktl69ib7eag',
        brandId: 'cmtbqg4og0001gktlo8p2k7d1',
        contentItemId: 'ci_857b7ae88f07796bbaafc645',
        contentVersionId: 'cmtgafi84000s6stlqy7gyml7',
        status: 'ANALYZING'
      }
    });
    console.log('Insert success:', analysis);
  } catch (error) {
    console.error('Insert failed:', error);
  }
}
main().finally(() => prisma.$disconnect());
