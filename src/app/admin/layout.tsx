'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
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
          <Link href="/admin/dashboard" className={`block p-2 rounded hover:bg-gray-800 ${pathname === '/admin/dashboard' ? 'bg-gray-800' : ''}`}>
            Dashboard
          </Link>
          <Link href="/admin/organizations" className={`block p-2 rounded hover:bg-gray-800 ${pathname.startsWith('/admin/organizations') ? 'bg-gray-800' : ''}`}>
            Organizations
          </Link>
          {/* Add more links here */}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto text-gray-900">
        {children}
      </div>
    </div>
  );
}
