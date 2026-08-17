import { EmptyState } from '@abge/ui/components/ui/empty-state';
import { Skeleton } from '@abge/ui/components/ui/skeleton';
import { getCurrentSession } from '@abge/auth';
import { TenantRepository } from '@abge/tenant';

export default async function Page() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const repo = new TenantRepository(session);
  const brands = await repo.findManyBrands({
    take: 1,
    orderBy: { updatedAt: 'desc' }
  });
  const brand = brands.length > 0 ? brands[0] : null;

  if (brand?.onboardingStatus === 'GENERATING') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Intelligence</h1>
          <p className="text-muted-foreground">Your brand intelligence profile is being prepared.</p>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brand Intelligence</h1>
        <p className="text-muted-foreground">Your brand intelligence workspace will appear here.</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Your brand intelligence workspace will appear here."
      />
    </div>
  );
}
