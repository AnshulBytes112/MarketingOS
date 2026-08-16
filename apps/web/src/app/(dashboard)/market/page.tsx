import { EmptyState } from '@abge/ui/components/ui/empty-state';
import { Skeleton } from '@abge/ui/components/ui/skeleton';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Intelligence</h1>
        <p className="text-muted-foreground">Your market trends and social listening workspace will appear here.</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Your market trends and social listening workspace will appear here."
        
        
      />
    </div>
  );
}
