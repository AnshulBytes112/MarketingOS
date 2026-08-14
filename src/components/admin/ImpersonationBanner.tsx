'use client';

export function ImpersonationBanner({ userName }: { userName: string }) {
  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex justify-center items-center space-x-4 sticky top-0 z-50">
      <span>Viewing as {userName} — Platform Support</span>
      <form action="/api/admin/impersonate/stop" method="POST">
        <button type="submit" className="bg-white text-red-600 px-2 py-1 rounded text-xs hover:bg-red-50">
          Stop Impersonating
        </button>
      </form>
    </div>
  );
}
