import { requireAuth } from '@abge/auth';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { SwitchOrganization } from './switch-org-client';

export default async function SuspendedPage() {
  const session = await requireAuth({ allowSuspended: true });

  if (!session.isSuspended) {
    redirect('/overview');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0A11] p-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#16151A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Organization Suspended</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Your current organization has been suspended. You cannot access its data or perform any actions at this time. Please contact support or the platform administrator.
        </p>
        
        <SwitchOrganization />

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 mb-4">You are logged in as {session.role}</p>
          <a href="/api/auth/logout" className="inline-flex items-center justify-center text-sm font-medium text-white/70 hover:text-white transition-colors">
            Log out instead
          </a>
        </div>
      </div>
    </div>
  );
}
