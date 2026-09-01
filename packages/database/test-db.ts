import { prisma } from './src/client';
async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent Users:', users.map(u => ({ id: u.id, email: u.email })));
  
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recent Orgs:', orgs.map(o => ({ id: o.id, name: o.name, status: o.status })));
}
main().finally(() => process.exit(0));
