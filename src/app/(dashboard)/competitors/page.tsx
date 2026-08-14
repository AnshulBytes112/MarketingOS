import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Competitor Intelligence</h1>
        <p className="text-muted-foreground">Your competitive landscape monitoring will appear here.</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Your competitive landscape monitoring will appear here."
        
        
      />
    </div>
  );
}
