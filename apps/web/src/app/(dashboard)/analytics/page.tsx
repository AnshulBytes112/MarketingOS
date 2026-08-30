import { requireAuth } from '@abge/auth';
import { requirePermission } from '@abge/auth/guard';
import AnalyticsClient from './analytics-client';
import { getAnalyticsOverview, getContentPerformance } from './actions';
import { prisma } from '@abge/database';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Analytics | AI Brand Growth Engine',
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireAuth();
  
  if (!session.organizationId) {
    return <div className="p-8 text-center text-white">No active organization selected.</div>;
  }

  requirePermission(session, 'analytics.view');

  const canSync = session.effectivePermissions.includes('analytics.sync');
  const canExport = session.effectivePermissions.includes('analytics.export');

  // Parse date range from search params if needed, default to last 30 days
  const now = new Date();
  let from = new Date();
  from.setDate(now.getDate() - 30);
  let to = now;

  if (typeof searchParams.from === 'string' && typeof searchParams.to === 'string') {
    from = new Date(searchParams.from);
    to = new Date(searchParams.to);
  }

  const overview = await getAnalyticsOverview(session.organizationId, { from, to });
  const contentPerformance = await getContentPerformance(session.organizationId, { from, to });
  
  // Get active channels to allow syncing
  const channels = await prisma.contentChannel.findMany({
    where: {
      organizationId: session.organizationId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      platform: true
    }
  });

  return (
    <div className="flex-1 overflow-y-auto bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
            <p className="text-gray-400 mt-1">Measure actual performance across all published content.</p>
          </div>
        </header>

        <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>}>
          <AnalyticsClient 
            organizationId={session.organizationId}
            initialOverview={overview}
            initialContentPerformance={contentPerformance}
            channels={channels}
            canSync={canSync}
            canExport={canExport}
            initialDateRange={{ from: from.toISOString(), to: to.toISOString() }}
          />
        </Suspense>
      </div>
    </div>
  );
}
