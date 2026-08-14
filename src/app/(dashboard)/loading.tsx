import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
