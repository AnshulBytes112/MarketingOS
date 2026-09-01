import { prisma } from './src/client';
async function main() {
  const ids = ['cmtgafi84000s6stlqy7gyml7', 'cmtgagngs000u6stlozveoajr'];
  for (const id of ids) {
    const version = await prisma.contentGeneration.findUnique({
      where: { id },
      include: { contentItem: true }
    });
    console.log(`Version ID: ${id}`);
    console.log('Version:', version ? {
      id: version.id,
      contentItemId: version.contentItemId,
      brandId: version.brandId,
      organizationId: version.organizationId
    } : 'null');
    if (version?.contentItem) {
      console.log('Content Item:', {
        id: version.contentItem.id,
        brandId: version.contentItem.brandId,
        organizationId: version.contentItem.organizationId
      });
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
