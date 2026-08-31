import { prisma } from './src/client';
async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
    include: { memberships: true }
  });
  console.log('User memberships:', user?.memberships);
}
main().catch(console.error).finally(() => prisma.$disconnect());
