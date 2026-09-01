import { prisma } from '@abge/database';
import { PlatformRole, PlatformAdmin } from '@prisma/client';
import { getPlatformSessionToken } from './platform-session';
import { redirect } from 'next/navigation';

export type PlatformAuthenticatedContext = {
  platformAdminId: string;
  role: PlatformRole;
  platformAdmin: PlatformAdmin;
};

export async function getCurrentPlatformSession(): Promise<PlatformAuthenticatedContext | null> {
  const sessionToken = await getPlatformSessionToken();

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.platformSession.findUnique({
    where: { sessionToken },
    include: { platformAdmin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    platformAdminId: session.platformAdminId,
    role: session.platformAdmin.role,
    platformAdmin: session.platformAdmin,
  };
}

export async function requirePlatformAuth(): Promise<PlatformAuthenticatedContext> {
  const session = await getCurrentPlatformSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}

export async function requirePlatformRole(roles: PlatformRole[]): Promise<PlatformAuthenticatedContext> {
  const session = await requirePlatformAuth();
  
  if (!roles.includes(session.role)) {
    throw new Error('FORBIDDEN_PLATFORM');
  }

  return session;
}
