import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@abge/database';
import { Role } from '@prisma/client';
import { getEffectivePermissions, Permission } from '@abge/rbac';

export type AuthenticatedContext = {
  userId: string;
  organizationId: string;
  role: Role;
  isImpersonated: boolean;
  impersonatorId?: string;
  readOnly?: boolean;
  isSuspended?: boolean;
  effectivePermissions: string[];
  mustChangePassword?: boolean;
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

      if (membership && membership.status === 'ACTIVE') {
        const effectivePermissions = getEffectivePermissions(membership.role, membership.customPermissions);
        return {
          userId: impSession.targetUserId,
          organizationId: impSession.targetOrganizationId,
          role: membership.role,
          isImpersonated: true,
          impersonatorId: impSession.platformAdminId,
          readOnly: impSession.readOnly,
          effectivePermissions,
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

  const isSuspended = session.organization.status === 'SUSPENDED';

  // Get user's role in the active organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.activeOrganizationId,
        userId: session.userId,
      },
    },
  });

  if (!membership || membership.status !== 'ACTIVE') {
    return null;
  }

  const effectivePermissions = getEffectivePermissions(membership.role, membership.customPermissions);

  return {
    userId: session.userId,
    organizationId: session.activeOrganizationId,
    role: membership.role,
    isImpersonated: false,
    isSuspended,
    effectivePermissions,
    mustChangePassword: session.user.mustChangePassword,
  };
}

export async function requireAuth(options?: { allowSuspended?: boolean; allowForcePasswordReset?: boolean }): Promise<AuthenticatedContext> {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/api/auth/logout');
  }
  
  if (session.mustChangePassword && !options?.allowForcePasswordReset) {
    redirect('/force-password-reset');
  }

  if (session.isSuspended && !options?.allowSuspended) {
    redirect('/suspended');
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
  
  if (!session.effectivePermissions.includes(permission)) {
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
