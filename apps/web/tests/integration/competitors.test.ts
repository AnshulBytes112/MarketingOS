import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { prisma } from '@abge/database';
import type { Organization, Brand, User, BrandCompetitor } from '@prisma/client';
import { 
  getCompetitors, createCompetitor, updateCompetitor, deleteCompetitor
} from '../../src/app/(dashboard)/competitors/actions';
import {
  normalizePlatformHandle, normalizeWebsite
} from '../../src/app/(dashboard)/competitors/normalization';
import { requirePermission, requireAuth } from '@abge/auth';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@abge/auth', () => ({
  requirePermission: vi.fn(),
  requireAuth: vi.fn(),
}));

describe('Competitor CRUD Server Actions (REAL DB)', () => {
  let orgA: Organization;
  let orgB: Organization;
  let brandA1: Brand;
  let brandA2: Brand;
  let brandB: Brand;
  let userAdmin: User;
  let userViewer: User;

  beforeAll(async () => {
    // Setup Organizations
    orgA = await prisma.organization.upsert({
      where: { slug: 'org-test-a' },
      update: {},
      create: { name: 'Org Test A', slug: 'org-test-a' },
    });
    orgB = await prisma.organization.upsert({
      where: { slug: 'org-test-b' },
      update: {},
      create: { name: 'Org Test B', slug: 'org-test-b' },
    });

    // Setup Users
    userAdmin = await prisma.user.upsert({
      where: { email: 'admin-comp@test.com' },
      update: {},
      create: { email: 'admin-comp@test.com', name: 'Admin Comp' },
    });
    userViewer = await prisma.user.upsert({
      where: { email: 'viewer-comp@test.com' },
      update: {},
      create: { email: 'viewer-comp@test.com', name: 'Viewer Comp' },
    });

    // Setup Brands
    brandA1 = await prisma.brand.create({
      data: { name: 'Brand A1', organizationId: orgA.id }
    });
    brandA2 = await prisma.brand.create({
      data: { name: 'Brand A2', organizationId: orgA.id }
    });
    brandB = await prisma.brand.create({
      data: { name: 'Brand B', organizationId: orgB.id }
    });
  });

  afterAll(async () => {
    // Cleanup DB
    await prisma.brandCompetitor.deleteMany({
      where: { brandId: { in: [brandA1.id, brandA2.id, brandB.id] } }
    });
    await prisma.brand.deleteMany({
      where: { id: { in: [brandA1.id, brandA2.id, brandB.id] } }
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgA.id, orgB.id] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userAdmin.id, userViewer.id] } }
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation & Normalization Logic', () => {
    it('normalizes handles and websites correctly', () => {
      // Instagram username/URL normalization
      expect(normalizePlatformHandle('instagram', ' @Nike ')).toBe('nike');
      expect(normalizePlatformHandle('instagram', 'https://instagram.com/Nike?ref=test')).toBe('nike');

      // Twitter username/URL normalization
      expect(normalizePlatformHandle('twitter', ' @Nike ')).toBe('nike');
      expect(normalizePlatformHandle('twitter', 'https://twitter.com/Nike')).toBe('nike');
      expect(normalizePlatformHandle('twitter', 'https://x.com/Nike')).toBe('nike');

      // TikTok username/URL normalization
      expect(normalizePlatformHandle('tiktok', ' @Nike ')).toBe('nike');
      expect(normalizePlatformHandle('tiktok', 'https://tiktok.com/@Nike')).toBe('nike');

      // Facebook normalization
      expect(normalizePlatformHandle('facebook', 'Nike')).toBe('nike');
      expect(normalizePlatformHandle('facebook', 'https://www.facebook.com/Nike')).toBe('https://www.facebook.com/Nike');

      // LinkedIn normalization
      expect(normalizePlatformHandle('linkedin', 'company-name')).toBe('company-name');
      expect(normalizePlatformHandle('linkedin', 'https://linkedin.com/company/nike/')).toBe('https://linkedin.com/company/nike');

      // YouTube normalization
      expect(normalizePlatformHandle('youtube', 'nike')).toBe('@nike');
      expect(normalizePlatformHandle('youtube', '@nike')).toBe('@nike');
      expect(normalizePlatformHandle('youtube', 'https://youtube.com/@nike')).toBe('https://youtube.com/@nike');

      // Website URL normalization
      expect(normalizeWebsite('nike.com/')).toBe('nike.com');
      expect(normalizeWebsite('https://www.nike.com/about/')).toBe('nike.com/about');
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      // Default mock sessions as Admin of Org A
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
    });

    it('creates, reads, updates, and deletes competitors successfully', async () => {
      // 1. Create
      const created = await createCompetitor(brandA1.id, {
        name: 'Competitor One',
        websiteUrl: 'https://comp1.com',
        instagram: '@comp1_insta',
        facebook: 'comp1_fb',
        linkedin: 'comp1_linkedin',
        twitter: '@comp1_x',
        youtube: '@comp1_yt',
        tiktok: '@comp1_tt'
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Competitor One');
      expect(created.instagram).toBe('@comp1_insta'); // Raw stored value, normalized in comparison

      // 2. Read
      const list = await getCompetitors(brandA1.id);
      expect(list.some(c => c.id === created.id)).toBe(true);

      // 3. Update
      const updated = await updateCompetitor(created.id, brandA1.id, {
        name: 'Competitor One Updated',
        websiteUrl: 'https://comp1-new.com',
        instagram: '@comp1_insta_new',
        facebook: 'comp1_fb_new',
        linkedin: 'comp1_linkedin_new',
        twitter: '@comp1_x_new',
        youtube: '@comp1_yt_new',
        tiktok: '@comp1_tt_new'
      });

      expect(updated.name).toBe('Competitor One Updated');
      expect(updated.instagram).toBe('@comp1_insta_new');

      // 4. Delete
      const deleted = await deleteCompetitor(created.id, brandA1.id);
      expect(deleted.id).toBe(created.id);

      const postList = await getCompetitors(brandA1.id);
      expect(postList.some(c => c.id === created.id)).toBe(false);
    });

    it('supports compatibility with empty platform handles', async () => {
      const created = await createCompetitor(brandA1.id, {
        name: 'Legacy Competitor',
        websiteUrl: 'https://legacy.com',
      });
      expect(created.instagram).toBeNull();
      expect(created.twitter).toBeNull();

      const list = await getCompetitors(brandA1.id);
      expect(list.some(c => c.id === created.id)).toBe(true);

      await deleteCompetitor(created.id, brandA1.id);
    });
  });

  describe('Duplicate Detection', () => {
    beforeEach(() => {
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
    });

    it('rejects duplicate website or handles within the same brand', async () => {
      const comp1 = await createCompetitor(brandA1.id, {
        name: 'Original Comp',
        websiteUrl: 'https://original.com',
        instagram: '@original_ig'
      });

      // Try duplicate website URL
      await expect(
        createCompetitor(brandA1.id, {
          name: 'Duplicate Web Comp',
          websiteUrl: 'https://original.com',
        })
      ).rejects.toThrow(/website.*already exists/);

      // Try duplicate Instagram handle (with different casing and symbol)
      await expect(
        createCompetitor(brandA1.id, {
          name: 'Duplicate Insta Comp',
          websiteUrl: 'https://other.com',
          instagram: 'original_ig'
        })
      ).rejects.toThrow(/instagram handle.*already exists/);

      // Allows same website/handles on a different brand
      const otherBrandComp = await createCompetitor(brandA2.id, {
        name: 'Original Comp on Brand A2',
        websiteUrl: 'https://original.com',
        instagram: '@original_ig'
      });
      expect(otherBrandComp.id).toBeDefined();

      // Clean up
      await deleteCompetitor(comp1.id, brandA1.id);
      await deleteCompetitor(otherBrandComp.id, brandA2.id);
    });
  });

  describe('RBAC & Permission Control', () => {
    it('rejects mutations for VIEWER role', async () => {
      (requireAuth as any).mockResolvedValue({
        userId: userViewer.id,
        organizationId: orgA.id,
        role: 'VIEWER'
      });
      (requirePermission as any).mockRejectedValue(new Error('Unauthorized'));

      await expect(
        createCompetitor(brandA1.id, {
          name: 'Viewer Try',
          websiteUrl: 'https://viewer.com',
        })
      ).rejects.toThrow(/Unauthorized/);
    });
  });

  describe('Tenant & Brand Isolation', () => {
    let competitorA: BrandCompetitor;

    beforeAll(async () => {
      // Create competitor in Org A / Brand A1
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      competitorA = await createCompetitor(brandA1.id, {
        name: 'Org A Competitor',
        websiteUrl: 'https://orga.com',
      });
    });

    afterAll(async () => {
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      await deleteCompetitor(competitorA.id, brandA1.id);
    });

    it('rejects accessing or mutating Org A competitor by Org B user', async () => {
      // Mock session as Org B user
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgB.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgB.id,
        role: 'ADMIN'
      });

      // Try reading Org A brand's competitors
      await expect(getCompetitors(brandA1.id)).rejects.toThrow(/Brand not found or access denied/);

      // Try updating Org A competitor
      await expect(
        updateCompetitor(competitorA.id, brandA1.id, {
          name: 'Hacked',
          websiteUrl: 'https://hacked.com',
        })
      ).rejects.toThrow(/Competitor not found or access denied/);

      // Try deleting Org A competitor
      await expect(deleteCompetitor(competitorA.id, brandA1.id)).rejects.toThrow(/Competitor not found or access denied/);
    });

    it('rejects mutating Org A competitor using a different Brand A2', async () => {
      // Mock session back to Org A
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });

      // Try updating competitorA (brandA1) using brandA2 parameter
      await expect(
        updateCompetitor(competitorA.id, brandA2.id, {
          name: 'Brand Cross Try',
          websiteUrl: 'https://cross.com',
        })
      ).rejects.toThrow(/Competitor not found or access denied/);

      // Try deleting competitorA using brandA2 parameter
      await expect(deleteCompetitor(competitorA.id, brandA2.id)).rejects.toThrow(/Competitor not found or access denied/);
    });
  });
});
