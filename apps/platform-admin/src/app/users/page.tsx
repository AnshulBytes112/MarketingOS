import { requirePlatformAuth } from '@abge/auth';
import { prisma } from '@abge/database';

export default async function PlatformUsersPage() {
  await requirePlatformAuth();

  const platformAdmins = await prisma.platformAdmin.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Administrators</h1>
        <p className="text-muted-foreground">Manage platform administration accounts.</p>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {platformAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{admin.name || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {platformAdmins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No platform administrators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
