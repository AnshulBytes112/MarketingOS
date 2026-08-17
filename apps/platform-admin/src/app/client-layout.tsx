'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800 text-xl font-bold">
          BhojAI Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className={`block p-2 rounded hover:bg-gray-800 ${pathname === '/dashboard' ? 'bg-gray-800' : ''}`}>
            Dashboard
          </Link>
          <Link href="/organizations" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/organizations') ? 'bg-gray-800' : ''}`}>
            Organizations
          </Link>
          <Link href="/users" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/users') ? 'bg-gray-800' : ''}`}>
            Users
          </Link>
          <Link href="/billing" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/billing') ? 'bg-gray-800' : ''}`}>
            Billing
          </Link>
          <Link href="/feature-flags" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/feature-flags') ? 'bg-gray-800' : ''}`}>
            Feature Flags
          </Link>
          <Link href="/audit" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/audit') ? 'bg-gray-800' : ''}`}>
            Audit
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto text-gray-900">
        {children}
      </div>
    </div>
  );
}
