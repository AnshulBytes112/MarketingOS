import { AppShell } from '@/components/layout/AppShell';
import { requireAuth } from '@/lib/auth/guard';
import { prisma } from '@/lib/db';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const organization = await prisma.organization.findUnique({ where: { id: session.organizationId } });
  
  // Need to pass session/user data down to Client Components, usually via a Context
  // Here we'll just wrap the AppShell and assume AppShell could use it if we converted it to Server Component
  // but since AppShell is 'use client', we can pass it as props
  
  return (
    <AppShell 
      user={{ name: user?.name || 'User', role: session.role }} 
      organization={{ id: organization?.id || '', name: organization?.name || 'Org' }}
    >
      {children}
    </AppShell>
  );
}
