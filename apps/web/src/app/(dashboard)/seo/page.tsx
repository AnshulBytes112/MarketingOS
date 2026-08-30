import { requireAuth, requirePermission } from '@abge/auth';
import SeoClient from './seo-client';
import { getSeoOverview } from './actions';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'SEO Intelligence | AI Brand Growth Engine',
};

export default async function SeoPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await requireAuth();
  
  if (!session.organizationId) {
    return <div className="p-8 text-center text-white">No active organization selected.</div>;
  }

  await requirePermission('seo.view' as any);

  const canAnalyze = session.effectivePermissions.includes('seo.analyze');
  const canOptimize = session.effectivePermissions.includes('seo.optimize');
  const canExport = session.effectivePermissions.includes('seo.export');

  // Parse date range from search params if needed, default to last 30 days
  const now = new Date();
  let from = new Date();
  from.setDate(now.getDate() - 30);
  let to = now;

  if (typeof searchParams.from === 'string' && typeof searchParams.to === 'string') {
    from = new Date(searchParams.from);
    to = new Date(searchParams.to);
  }

  const overview = await getSeoOverview(session.organizationId, { from, to });
  
  return (
    <div className="flex-1 overflow-y-auto bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">SEO Intelligence</h1>
            <p className="text-gray-400 mt-1">Analyze search intent and keyword optimization across your generated content.</p>
          </div>
        </header>

        <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>}>
          <SeoClient 
            organizationId={session.organizationId}
            initialOverview={overview}
            canAnalyze={canAnalyze}
            canOptimize={canOptimize}
            canExport={canExport}
            initialDateRange={{ from: from.toISOString(), to: to.toISOString() }}
          />
        </Suspense>
      </div>
    </div>
  );
}
