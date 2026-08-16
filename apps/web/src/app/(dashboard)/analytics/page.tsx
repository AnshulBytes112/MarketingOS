import { EmptyState } from '@abge/ui/components/ui/empty-state';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Engine</h1>
        <p className="text-muted-foreground">Your post-level and campaign-level performance data will appear here.</p>
      </div>
      <EmptyState
        title="No data yet"
        description="Your post-level and campaign-level performance data will appear here."
        
        
      />
    </div>
  );
}
