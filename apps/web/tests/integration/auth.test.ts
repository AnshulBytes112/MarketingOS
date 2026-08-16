/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getCurrentSession, requirePermission, requireRole } from '@abge/auth';
import { updateSessionOrganization } from '@abge/auth';
import { prisma } from '@abge/database';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as headers from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Authentication & RBAC Integration (REAL DB)', () => {
  let orgId: string;
  const users: Record<Role, { id: string; sessionToken: string }> = {} as any;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const org = await prisma.organization.create({
      data: { name: 'Auth Test Org', slug: 'auth-test-org-' + Date.now() },
    });
    orgId = org.id;

    const roles = Object.values(Role);
    
    for (const role of roles) {
      const email = `${role.toLowerCase()}@authtest.com`;
      const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash },
        create: { email, name: `User ${role}`, passwordHash },
      });

      await prisma.organizationMember.create({
        data: { organizationId: orgId, userId: user.id, role },
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const session = await prisma.session.create({
        data: {
          sessionToken: `test-token-${role}`,
          userId: user.id,
          activeOrganizationId: orgId,
          expiresAt,
        }
      });
      users[role] = { id: user.id, sessionToken: session.sessionToken };
    }
  });

  afterAll(async () => {
    if (orgId) {
      const userIds = Object.values(users).map(u => u.id);
      await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
      await prisma.organization.delete({ where: { id: orgId } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  });

  const mockCookies = (token: string | null) => {
    vi.mocked(headers.cookies).mockResolvedValue({
      get: () => (token ? { value: token, name: 'abge_session' } : undefined),
      set: vi.fn(),
      delete: vi.fn(),
    } as any);
  };

  it('getCurrentSession returns correct session context for valid token', async () => {
    mockCookies(users[Role.ADMIN].sessionToken);
    const session = await getCurrentSession();
    
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(users[Role.ADMIN].id);
    expect(session?.organizationId).toBe(orgId);
    expect(session?.role).toBe(Role.ADMIN);
  });

  it('getCurrentSession returns null for invalid token', async () => {
    mockCookies('invalid-token');
    const session = await getCurrentSession();
    expect(session).toBeNull();
  });

  // OWNER tests
  it('OWNER can manage_org', async () => {
    mockCookies(users[Role.OWNER].sessionToken);
    await expect(requirePermission('manage_org')).resolves.not.toThrow();
  });

  // ADMIN tests
  it('ADMIN can manage_users but cannot manage_org', async () => {
    mockCookies(users[Role.ADMIN].sessionToken);
    await expect(requirePermission('manage_users')).resolves.not.toThrow();
    await expect(requirePermission('manage_org')).rejects.toThrow('FORBIDDEN');
  });

  // MARKETING_MANAGER tests
  it('MARKETING_MANAGER can manage_campaigns but cannot manage_users', async () => {
    mockCookies(users[Role.MARKETING_MANAGER].sessionToken);
    await expect(requirePermission('manage_campaigns')).resolves.not.toThrow();
    await expect(requirePermission('manage_users')).rejects.toThrow('FORBIDDEN');
  });

  // CONTENT_MANAGER tests
  it('CONTENT_MANAGER can generate_content but cannot manage_campaigns', async () => {
    mockCookies(users[Role.CONTENT_MANAGER].sessionToken);
    await expect(requirePermission('generate_content')).resolves.not.toThrow();
    await expect(requirePermission('manage_campaigns')).rejects.toThrow('FORBIDDEN');
  });

  // DESIGNER tests
  it('DESIGNER can generate_content but cannot publish_content', async () => {
    mockCookies(users[Role.DESIGNER].sessionToken);
    await expect(requirePermission('generate_content')).resolves.not.toThrow();
    await expect(requirePermission('publish_content')).rejects.toThrow('FORBIDDEN');
  });

  // ANALYST tests
  it('ANALYST can view_analytics but cannot generate_content', async () => {
    mockCookies(users[Role.ANALYST].sessionToken);
    await expect(requirePermission('view_analytics')).resolves.not.toThrow();
    await expect(requirePermission('generate_content')).rejects.toThrow('FORBIDDEN');
  });

  // APPROVER tests
  it('APPROVER can approve_content but cannot generate_content', async () => {
    mockCookies(users[Role.APPROVER].sessionToken);
    await expect(requirePermission('approve_content')).resolves.not.toThrow();
    await expect(requirePermission('generate_content')).rejects.toThrow('FORBIDDEN');
  });

  // VIEWER tests
  it('VIEWER can view_analytics but cannot do anything else', async () => {
    mockCookies(users[Role.VIEWER].sessionToken);
    await expect(requirePermission('view_analytics')).resolves.not.toThrow();
    
    const forbiddenPermissions = [
      'manage_org', 'manage_brand_dna', 'generate_content', 
      'approve_content', 'reject_content', 'publish_content', 
      'manage_social_connections', 'manage_campaigns', 
      'manage_users', 'manage_billing'
    ] as const;
    
    for (const p of forbiddenPermissions) {
      await expect(requirePermission(p)).rejects.toThrow('FORBIDDEN');
    }
  });

  it('updateSessionOrganization rejects unauthorized organization switch', async () => {
    mockCookies(users[Role.VIEWER].sessionToken);
    
    // Attempt to switch to an organization the VIEWER does not belong to
    // Use an arbitrary CUID for the rogue organization
    const rogueOrgId = 'rogue-org-cuid-1234';
    
    await expect(updateSessionOrganization(rogueOrgId)).rejects.toThrow('Unauthorized organization switch');
  });

});
