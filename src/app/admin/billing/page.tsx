import { requirePlatformAuth } from '@/lib/auth/platform-guard';
import { prisma } from '@/lib/db/index';

export default async function BillingPage() {
  await requirePlatformAuth();

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      planTier: true,
      createdAt: true,
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing Administration</h1>
        <p className="text-muted-foreground">View organization plans and entitlements. Note: Payment processing is handled via external system.</p>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Current Plan</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    org.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                    org.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {org.planTier}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {organizations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
