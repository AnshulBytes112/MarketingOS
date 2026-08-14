import { cookies } from 'next/headers';
import { prisma } from '../db/index';
import { Role } from '@prisma/client';
import { hasPermission, Permission } from './rbac';

export type AuthenticatedContext = {
  userId: string;
  organizationId: string;
  role: Role;
  isImpersonated: boolean;
  impersonatorId?: string;
  readOnly?: boolean;
};

export async function getCurrentSession(): Promise<AuthenticatedContext | null> {
  const cookieStore = await cookies();
  const impersonationToken = cookieStore.get('abge_impersonation_session')?.value;
  const sessionToken = cookieStore.get('abge_session')?.value;

  if (impersonationToken) {
    const impSession = await prisma.impersonationSession.findUnique({
      where: { sessionToken: impersonationToken },
      include: { targetOrganization: true },
    });

    if (impSession && impSession.expiresAt > new Date() && !impSession.endedAt) {
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: impSession.targetOrganizationId,
            userId: impSession.targetUserId,
          },
        },
      });

      if (membership) {
        return {
          userId: impSession.targetUserId,
          organizationId: impSession.targetOrganizationId,
          role: membership.role,
          isImpersonated: true,
          impersonatorId: impSession.platformAdminId,
          readOnly: impSession.readOnly,
        };
      }
    }
  }

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { 
      user: true,
      organization: true
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  if (!session.activeOrganizationId || !session.organization) {
    return null;
  }

  if (session.organization.status === 'SUSPENDED') {
    return null;
  }

  // Get user's role in the active organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.activeOrganizationId,
        userId: session.userId,
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    userId: session.userId,
    organizationId: session.activeOrganizationId,
    role: membership.role,
    isImpersonated: false,
  };
}

export async function requireAuth(): Promise<AuthenticatedContext> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<AuthenticatedContext> {
  const session = await requireAuth();
  
  // If it's a mutation and the session is read-only impersonated, block it.
  // In this simplified check, we'll assume requirePermission is used for writes if the permission is a mutation.
  // A more robust implementation would check the request method, but this is a starting point.
  if (session.isImpersonated && session.readOnly && !permission.startsWith('view_')) {
     throw new Error('FORBIDDEN_READ_ONLY_IMPERSONATION');
  }
  
  if (!hasPermission(session.role, permission)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}

export async function requireRole(roles: Role[]): Promise<AuthenticatedContext> {
  const session = await requireAuth();
  
  if (!roles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}
