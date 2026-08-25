import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import StrategyClient from './strategy-client';

export default async function StrategyPage() {
  const session = await requireAuth();

  // Fetch real brand from database for active organization
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
        <h3 className="text-white font-medium mb-1">No Brand Found</h3>
        <p className="text-gray-400 text-sm">Please create a brand first.</p>
      </div>
    );
  }

  return (
    <StrategyClient
      brandId={brand.id}
      brandName={brand.name}
      userRole={session.role}
    />
  );
}
