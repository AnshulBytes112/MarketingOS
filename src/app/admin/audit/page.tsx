import { requirePlatformAuth } from '@/lib/auth/platform-guard';
import { prisma } from '@/lib/db/index';

export default async function AuditPage() {
  await requirePlatformAuth();

  const auditLogs = await prisma.platformAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to recent 100 for MVP
    include: {
      platformAdmin: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Audit Logs</h1>
        <p className="text-muted-foreground">Review recent platform administration activities.</p>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Administrator</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target Entity</th>
              <th className="px-4 py-3 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium">
                  {log.platformAdmin.name || log.platformAdmin.email}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.entityType}: {log.entityId}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {log.metadata ? JSON.stringify(log.metadata) : '-'}
                </td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
