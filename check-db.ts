import { prisma } from './packages/database/src/index.ts';

async function run() {
  const auditLogs = await prisma.auditLog.findMany({ 
    where: { entityType: 'ContentPlan', action: 'CALENDAR_GENERATION_FAILED' }, 
    orderBy: { createdAt: 'desc' }, 
    take: 3 
  });
  console.log('AuditLogs:', JSON.stringify(auditLogs, null, 2));
  process.exit(0);
}
run();
