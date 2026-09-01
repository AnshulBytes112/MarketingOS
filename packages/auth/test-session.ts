import { prisma } from '@abge/database';

async function main() {
  const session = await prisma.session.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { organization: true }
  });
  console.log('Latest session:', session);

  if (!session) return;

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.activeOrganizationId!,
        userId: session.userId,
      },
    },
  });
  console.log('Membership:', membership);
}

main().catch(console.error).finally(() => process.exit(0));
