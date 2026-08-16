import { EmptyState } from '@abge/ui/components/ui/empty-state';
import { Skeleton } from '@abge/ui/components/ui/skeleton';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Strategy Engine</h1>
        <p className="text-muted-foreground">Your monthly strategy, content pillars, and funnel mapping will appear here.</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Your monthly strategy, content pillars, and funnel mapping will appear here."
        
        
      />
    </div>
  );
}
