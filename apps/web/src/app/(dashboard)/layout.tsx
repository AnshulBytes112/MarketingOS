import { AppShell } from '@/components/layout/AppShell';
import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const organization = await prisma.organization.findUnique({ where: { id: session.organizationId } });
  
  return (
    <>
      {session.isImpersonated && (
        <ImpersonationBanner userName={user?.name || user?.email || 'User'} />
      )}
      <AppShell 
        user={{ name: user?.name || 'User', role: session.role }} 
        organization={{ id: organization?.id || '', name: organization?.name || 'Org' }}
      >
        {children}
      </AppShell>
    </>
  );
}
