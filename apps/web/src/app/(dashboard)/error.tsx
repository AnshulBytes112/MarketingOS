'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0914] text-white p-6">
      <div className="bg-[#12111A] border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Dashboard Error</h2>
        <p className="text-sm text-gray-400">Something went wrong while loading this page.</p>
        <button 
          onClick={() => reset()}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/30"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
