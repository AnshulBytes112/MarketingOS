import { prisma } from './src/client';
async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
    include: { memberships: true }
  });
  if (user && user.memberships.length > 0) {
    const membership = user.memberships[0];
    const updated = await prisma.organizationMember.update({
      where: { id: membership.id },
      data: {
        organizationId: 'cmtbqfx2n0001uktl69ib7eag',
        role: 'OWNER'
      }
    });
    console.log('Membership updated:', updated);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
