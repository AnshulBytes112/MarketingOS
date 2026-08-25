/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { requirePermission, getCurrentSession } from '@abge/auth';
import { requirePlatformAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import { Role, PlatformRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as headers from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Platform Admin & Impersonation Integration', () => {
  let orgId: string;
  let suspendedOrgId: string;
  let tenantUserId: string;
  let tenantAdminId: string;
  let platformAdminId: string;
  let tenantSessionToken: string;
  let tenantAdminSessionToken: string;
  let platformSessionToken: string;
  let impersonationSessionToken: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create Orgs
    const org = await prisma.organization.create({
      data: { name: 'Active Org', slug: 'active-org-' + Date.now(), status: 'ACTIVE' },
    });
    orgId = org.id;

    const suspendedOrg = await prisma.organization.create({
      data: { name: 'Suspended Org', slug: 'suspended-org-' + Date.now(), status: 'SUSPENDED' },
    });
    suspendedOrgId = suspendedOrg.id;

    // Create Tenant User (OWNER of active org)
    const tenantUser = await prisma.user.create({
      data: { email: 'owner@active.com', name: 'Tenant Owner', passwordHash },
    });
    tenantUserId = tenantUser.id;
    await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: tenantUserId, role: Role.OWNER },
    });
    const tenantSession = await prisma.session.create({
      data: { sessionToken: 'tenant-session', userId: tenantUserId, activeOrganizationId: orgId, expiresAt: new Date(Date.now() + 1000000) }
    });
    tenantSessionToken = tenantSession.sessionToken;

    // Create Tenant Admin
    const tenantAdmin = await prisma.user.create({
      data: { email: 'admin@active.com', name: 'Tenant Admin', passwordHash },
    });
    tenantAdminId = tenantAdmin.id;
    await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: tenantAdminId, role: Role.ADMIN },
    });
    const tenantAdminSession = await prisma.session.create({
      data: { sessionToken: 'tenant-admin-session', userId: tenantAdminId, activeOrganizationId: orgId, expiresAt: new Date(Date.now() + 1000000) }
    });
    tenantAdminSessionToken = tenantAdminSession.sessionToken;

    // Create Platform Admin
    const platformAdmin = await prisma.platformAdmin.create({
      data: { email: 'platform@admin.com', name: 'Platform Admin', passwordHash, role: PlatformRole.SUPPORT }
    });
    platformAdminId = platformAdmin.id;
    const platformSession = await prisma.platformSession.create({
      data: { sessionToken: 'platform-session', platformAdminId, expiresAt: new Date(Date.now() + 1000000) }
    });
    platformSessionToken = platformSession.sessionToken;

    // Create Impersonation Session
    const impSession = await prisma.impersonationSession.create({
      data: {
        platformAdminId,
        targetUserId: tenantUserId,
        targetOrganizationId: orgId,
        sessionToken: 'impersonation-session',
        readOnly: true,
        expiresAt: new Date(Date.now() + 1000000)
      }
    });
    impersonationSessionToken = impSession.sessionToken;
  });

  afterAll(async () => {
    await prisma.impersonationSession.deleteMany({});
    await prisma.platformSession.deleteMany({});
    await prisma.platformAdmin.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.organizationMember.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
  });

  const mockCookies = (abgeSession: string | null, platformSession: string | null, impersonationSession: string | null = null) => {
    vi.mocked(headers.cookies).mockResolvedValue({
      get: (name: string) => {
        if (name === 'abge_session' && abgeSession) return { value: abgeSession, name };
        if (name === 'abge_platform_session' && platformSession) return { value: platformSession, name };
        if (name === 'abge_impersonation_session' && impersonationSession) return { value: impersonationSession, name };
        return undefined;
      },
      set: vi.fn(),
      delete: vi.fn(),
    } as any);
  };

  it('non-platform user cannot access admin', async () => {
    mockCookies(tenantSessionToken, null);
    await expect(requirePlatformAuth()).rejects.toThrow('NEXT_REDIRECT');
  });

  it('tenant ADMIN cannot access platform admin', async () => {
    mockCookies(tenantAdminSessionToken, null);
    await expect(requirePlatformAuth()).rejects.toThrow('NEXT_REDIRECT');
  });

  it('platform admin can access permitted admin operations', async () => {
    mockCookies(null, platformSessionToken);
    const pSession = await requirePlatformAuth();
    expect(pSession.platformAdminId).toBe(platformAdminId);
  });

  it('suspended organization is blocked for tenant users', async () => {
    // Re-assign tenant user to suspended org
    await prisma.session.update({
      where: { sessionToken: tenantSessionToken },
      data: { activeOrganizationId: suspendedOrgId }
    });
    
    // Add to member to pass membership check
    await prisma.organizationMember.create({
      data: { organizationId: suspendedOrgId, userId: tenantUserId, role: Role.VIEWER },
    });

    mockCookies(tenantSessionToken, null);
    const session = await getCurrentSession();
    expect(session).toBeNull(); // should be null because it's suspended
  });

  it('impersonation creates a separate session context', async () => {
    mockCookies(null, null, impersonationSessionToken);
    const session = await getCurrentSession();
    
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(tenantUserId);
    expect(session?.isImpersonated).toBe(true);
    expect(session?.impersonatorId).toBe(platformAdminId);
    expect(session?.readOnly).toBe(true);
  });

  it('impersonation cannot escalate privileges (readOnly blocks mutations)', async () => {
    mockCookies(null, null, impersonationSessionToken);
    // manage_org is a mutation-like permission
    await expect(requirePermission('manage_org')).rejects.toThrow('FORBIDDEN_READ_ONLY_IMPERSONATION');
  });
  it('feature flag: missing flag follows default', async () => {
    const { isFeatureEnabled } = await import('../../src/lib/feature-flags');
    const isEnabled = await isFeatureEnabled(orgId, 'MISSING_FLAG', true);
    expect(isEnabled).toBe(true);
    
    const isEnabledFalse = await isFeatureEnabled(orgId, 'MISSING_FLAG', false);
    expect(isEnabledFalse).toBe(false);
  });

  it('feature flag: disabled evaluates false, enabled evaluates true', async () => {
    const { setFeatureFlag, isFeatureEnabled } = await import('../../src/lib/feature-flags');
    
    await setFeatureFlag(orgId, 'TEST_FLAG', true);
    let enabled = await isFeatureEnabled(orgId, 'TEST_FLAG');
    expect(enabled).toBe(true);

    await setFeatureFlag(orgId, 'TEST_FLAG', false);
    enabled = await isFeatureEnabled(orgId, 'TEST_FLAG');
    expect(enabled).toBe(false);
  });

  it('billing: entitlement checks server-side', async () => {
    const { checkPlanEntitlement, requirePlanEntitlement } = await import('../../src/lib/billing');
    
    // Active Org is set to STARTER by default
    const isStarter = await checkPlanEntitlement(orgId, 'STARTER');
    expect(isStarter).toBe(true);
    
    const isGrowth = await checkPlanEntitlement(orgId, 'GROWTH');
    expect(isGrowth).toBe(false);

    await expect(requirePlanEntitlement(orgId, 'GROWTH')).rejects.toThrow('PAYMENT_REQUIRED');
  });

});
