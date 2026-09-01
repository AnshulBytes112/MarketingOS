import { requireAuth, requirePermission } from '@abge/auth';
import { prisma as dbPrisma, recreatePrismaClient } from '@abge/database';
import MarketIntelClient from './market-intel-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const prisma = (() => {
  if (dbPrisma && 'marketInsight' in dbPrisma) {
    return dbPrisma;
  }
  return recreatePrismaClient();
})();

export const metadata = {
  title: 'Market Intelligence | AI Brand Growth Engine',
};

export default async function MarketIntelligencePage() {
  const session = await requireAuth();
  
  if (!session.organizationId) {
    return <div className="p-8 text-center text-white">No active organization selected.</div>;
  }

  await requirePermission('market.view');

  const canRefresh = session.effectivePermissions.includes('market.refresh');
  const canAnalyze = session.effectivePermissions.includes('market.analyze');
  const canExport = session.effectivePermissions.includes('market.export');
  const canCreateContent = session.effectivePermissions.includes('content.create');

  // Fetch all brands in this organization
  const brands = await prisma.brand.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex-1 overflow-y-auto bg-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Market Intelligence Engine</h1>
            <p className="text-gray-400 mt-1">Cross-reference first-party brand performance, strategies, and competitor data with external market trends.</p>
          </div>
        </header>

        <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>}>
          <MarketIntelClient
            brands={brands}
            canRefresh={canRefresh}
            canAnalyze={canAnalyze}
            canExport={canExport}
            canCreateContent={canCreateContent}
          />
        </Suspense>
      </div>
    </div>
  );
}
