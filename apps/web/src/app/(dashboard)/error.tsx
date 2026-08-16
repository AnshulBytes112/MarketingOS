'use client';

import { useEffect } from 'react';
import { Button } from '@abge/ui/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We would log the error to our structured logger here, but we are client-side.
    // Ideally we would send an API request to a logging endpoint, but for now we just log to console.
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-[500px]">
        An unexpected error occurred while loading this page. We&apos;ve logged the issue and are looking into it.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
