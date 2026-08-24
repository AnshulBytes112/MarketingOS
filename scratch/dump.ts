import { prisma } from '@abge/database';
async function main() {
  const admins = await prisma.platformAdmin.findMany();
  console.log(admins);
}
main().finally(() => prisma.$disconnect());
