import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { TenantRepository } from '@abge/tenant';
import { prisma } from '@abge/database';
import type { Organization, Brand, User } from '@prisma/client';
import { updateBrandDnaField, publishBrandDnaVersionAction, restoreBrandDnaVersionAction } from '../../src/app/(dashboard)/brand/actions';
import { requirePermission, requireAuth } from '@abge/auth';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/queue', () => ({
  getBrandAssetQueue: vi.fn(),
  enqueueBrandDnaGeneration: vi.fn(),
}));

vi.mock('@/lib/s3', () => ({
  s3: {
    deleteObject: vi.fn(),
    generateSignedDownloadUrl: vi.fn(),
  }
}));

vi.mock('@abge/auth', () => ({
  requirePermission: vi.fn(),
  requireAuth: vi.fn(),
}));

describe('Brand DNA Versioning (REAL DB)', () => {
  let org: Organization;
  let brand: Brand;
  let user: User;

  beforeAll(async () => {
    org = await prisma.organization.upsert({
      where: { slug: 'test-org-versioning' },
      update: {},
      create: { name: 'Test Org Versioning', slug: 'test-org-versioning' },
    });

    user = await prisma.user.upsert({
      where: { email: 'versioning@test.com' },
      update: {},
      create: { email: 'versioning@test.com', name: 'Versioning User' },
    });

    brand = await prisma.brand.create({ data: { name: 'Versioning Brand', organizationId: org.id } });
  });

  beforeEach(() => {
    (requirePermission as any).mockResolvedValue({
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN'
    });
    
    (requireAuth as any).mockResolvedValue({
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN'
    });
  });

  afterAll(async () => {
    await prisma.brandDNAEdit.deleteMany({ where: { organizationId: org.id } });
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.brandDNAVersion.deleteMany({ where: { organizationId: org.id } });
    await prisma.brand.deleteMany({ where: { id: brand.id } });
    await prisma.organization.deleteMany({ where: { id: org.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  });

  it('first manual edit on AI_GENERATION version creates MANUAL_EDIT version', async () => {
    const aiVersion = await prisma.brandDNAVersion.create({
      data: {
        organizationId: org.id,
        brandId: brand.id,
        version: 1,
        status: 'COMPLETED',
        publicationStatus: 'DRAFT',
        source: 'AI_GENERATION',
        personality: 'Friendly',
      }
    });

    const res = await updateBrandDnaField({
      versionId: aiVersion.id,
      brandId: brand.id,
      field: 'personality',
      value: 'Professional'
    });

    expect(res.success).toBe(true);
    const newVersionId = res.targetVersionId;
    expect(newVersionId).toBeDefined();
    expect(newVersionId).not.toBe(aiVersion.id);

    // Verify original is untouched
    const original = await prisma.brandDNAVersion.findUnique({ where: { id: aiVersion.id } });
    expect(original?.personality).toBe('Friendly');

    // Verify new is updated
    const newVersion = await prisma.brandDNAVersion.findUnique({ where: { id: newVersionId } });
    expect(newVersion?.personality).toBe('Professional');
    expect(newVersion?.source).toBe('MANUAL_EDIT');
    expect(newVersion?.version).toBe(2);
  });

  it('subsequent manual edits update in place', async () => {
    const manualVersion = await prisma.brandDNAVersion.findFirst({
      where: { source: 'MANUAL_EDIT', brandId: brand.id }
    });

    const res = await updateBrandDnaField({
      versionId: manualVersion!.id,
      brandId: brand.id,
      field: 'voice',
      value: 'Calm'
    });

    expect(res.success).toBe(true);
    expect(res.targetVersionId).toBe(manualVersion!.id);

    const updated = await prisma.brandDNAVersion.findUnique({ where: { id: manualVersion!.id } });
    expect(updated?.voice).toBe('Calm');

    // Verify total version count is still 2
    const count = await prisma.brandDNAVersion.count({ where: { brandId: brand.id } });
    expect(count).toBe(2);
  });

  it('publishing correctly supersedes and sets ACTIVE', async () => {
    const repo = new TenantRepository({ organizationId: org.id });
    
    // Publish version 1
    const v1 = await prisma.brandDNAVersion.findFirst({ where: { version: 1, brandId: brand.id } });
    await publishBrandDnaVersionAction(brand.id, v1!.id);

    let active = await repo.getActiveBrandDna(brand.id);
    expect(active?.id).toBe(v1!.id);

    // Publish version 2
    const v2 = await prisma.brandDNAVersion.findFirst({ where: { version: 2, brandId: brand.id } });
    await publishBrandDnaVersionAction(brand.id, v2!.id);

    active = await repo.getActiveBrandDna(brand.id);
    expect(active?.id).toBe(v2!.id);

    // Verify v1 is SUPERSEDED
    const v1Updated = await prisma.brandDNAVersion.findUnique({ where: { id: v1!.id } });
    expect(v1Updated?.publicationStatus).toBe('SUPERSEDED');
  });

  it('restoring creates a new version', async () => {
    const repo = new TenantRepository({ organizationId: org.id });
    const v1 = await prisma.brandDNAVersion.findFirst({ where: { version: 1, brandId: brand.id } });
    
    await restoreBrandDnaVersionAction(brand.id, v1!.id);
    
    const restored = await prisma.brandDNAVersion.findFirst({
      where: { brandId: brand.id, source: 'RESTORED' }
    });
    
    expect(restored!.version).toBe(3);
    expect(restored!.restoredFromVersionId).toBe(v1!.id);
    expect(restored!.publicationStatus).toBe('ACTIVE');

    const active = await repo.getActiveBrandDna(brand.id);
    expect(active?.id).toBe(restored!.id);

    // V2 should now be SUPERSEDED
    const v2 = await prisma.brandDNAVersion.findFirst({ where: { version: 2, brandId: brand.id } });
    expect(v2?.publicationStatus).toBe('SUPERSEDED');
  });
});
