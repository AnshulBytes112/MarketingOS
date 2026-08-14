import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Executive overview of your brand performance</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Executive overview of your brand performance"
        
        
      />
    </div>
  );
}
