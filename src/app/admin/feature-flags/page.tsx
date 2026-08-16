import { requirePlatformAuth } from '@/lib/auth/platform-guard';
import { prisma } from '@/lib/db/index';
import { redirect } from 'next/navigation';

export default async function FeatureFlagsPage() {
  await requirePlatformAuth();

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      featureFlags: true,
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">Manage organization feature flags.</p>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Flag Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {organizations.map((org) => {
              // Show default empty state if no flags exist for org, else map them
              if (org.featureFlags.length === 0) {
                return (
                  <tr key={org.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{org.name}</td>
                    <td className="px-4 py-3 text-muted-foreground italic">No flags set</td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3 text-right">
                      {/* Simple form to add a dummy flag for demo */}
                      <form action={async () => {
                        'use server';
                        const { setFeatureFlag } = await import('@/lib/feature-flags');
                        await setFeatureFlag(org.id, 'BETA_FEATURES', true);
                        redirect('/admin/feature-flags');
                      }}>
                        <button type="submit" className="text-blue-500 hover:underline">Add BETA_FEATURES</button>
                      </form>
                    </td>
                  </tr>
                );
              }

              return org.featureFlags.map(flag => (
                <tr key={flag.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3">{flag.flagName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${flag.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={async () => {
                      'use server';
                      const { setFeatureFlag } = await import('@/lib/feature-flags');
                      await setFeatureFlag(org.id, flag.flagName, !flag.enabled);
                      redirect('/admin/feature-flags');
                    }}>
                      <button type="submit" className="text-blue-500 hover:underline">
                        Toggle
                      </button>
                    </form>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
