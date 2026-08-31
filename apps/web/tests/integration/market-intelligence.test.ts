import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { prisma } from '@abge/database';
import type { Organization, Brand, User } from '@prisma/client';
import { 
  getMarketInsights, 
  getLatestRunStatus, 
  refreshMarketIntelligence, 
  useOpportunityInContent 
} from '../../src/app/(dashboard)/market-intelligence/actions';
import { requirePermission, requireAuth } from '@abge/auth';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@abge/auth', () => ({
  requirePermission: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock('../../lib/queue', () => ({
  enqueueMarketIntelligence: vi.fn().mockResolvedValue({ id: 'mock-job-id' }),
}));

describe('Market Intelligence Server Actions Integration (REAL DB)', () => {
  let orgA: Organization;
  let orgB: Organization;
  let brandA: Brand;
  let brandB: Brand;
  let userAdmin: User;
  let userViewer: User;

  beforeAll(async () => {
    // 1. Setup Organizations
    orgA = await prisma.organization.upsert({
      where: { slug: 'org-intel-test-a' },
      update: {},
      create: { name: 'Org Intel Test A', slug: 'org-intel-test-a' },
    });
    orgB = await prisma.organization.upsert({
      where: { slug: 'org-intel-test-b' },
      update: {},
      create: { name: 'Org Intel Test B', slug: 'org-intel-test-b' },
    });

    // 2. Setup Users
    userAdmin = await prisma.user.upsert({
      where: { email: 'admin-intel@test.com' },
      update: {},
      create: { email: 'admin-intel@test.com', name: 'Admin Intel' },
    });
    userViewer = await prisma.user.upsert({
      where: { email: 'viewer-intel@test.com' },
      update: {},
      create: { email: 'viewer-intel@test.com', name: 'Viewer Intel' },
    });

    // 3. Setup Brands
    brandA = await prisma.brand.create({
      data: { name: 'Brand A', organizationId: orgA.id }
    });
    brandB = await prisma.brand.create({
      data: { name: 'Brand B', organizationId: orgB.id }
    });
  });

  afterAll(async () => {
    // Cleanup DB records
    await prisma.contentItem.deleteMany({
      where: { brandId: { in: [brandA.id, brandB.id] } }
    });
    await prisma.contentPlan.deleteMany({
      where: { brandId: { in: [brandA.id, brandB.id] } }
    });
    await prisma.strategy.deleteMany({
      where: { brandId: { in: [brandA.id, brandB.id] } }
    });
    await prisma.marketInsight.deleteMany({
      where: { brandId: { in: [brandA.id, brandB.id] } }
    });
    await prisma.marketIntelligenceRun.deleteMany({
      where: { brandId: { in: [brandA.id, brandB.id] } }
    });
    await prisma.brand.deleteMany({
      where: { id: { in: [brandA.id, brandB.id] } }
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

  describe('Tenant & Brand Isolation', () => {
    beforeEach(() => {
      // Mock session as User in Org A
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue(true);
    });

    it('rejects loading insights for a brand in Org B by Org A user', async () => {
      await expect(
        getMarketInsights({ brandId: brandB.id })
      ).rejects.toThrow(/Brand not found or unauthorized/);
    });

    it('rejects loading run status for a brand in Org B by Org A user', async () => {
      await expect(
        getLatestRunStatus(brandB.id)
      ).rejects.toThrow(/Brand not found or unauthorized/);
    });

    it('rejects refreshing market intelligence for a brand in Org B by Org A user', async () => {
      await expect(
        refreshMarketIntelligence(brandB.id)
      ).rejects.toThrow(/Brand not found or unauthorized/);
    });
  });

  describe('Refresh & Idempotency', () => {
    beforeEach(() => {
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue(true);
    });

    it('creates a queued run on refresh, and returns the same active run on duplicate refresh calls', async () => {
      // 1. Initial Refresh
      const res1 = await refreshMarketIntelligence(brandA.id);
      expect(res1.success).toBe(true);
      expect(res1.run).toBeDefined();
      expect(res1.run?.status).toBe('QUEUED');

      const runId = res1.run?.id;

      // 2. Duplicate Refresh (idempotency check)
      const res2 = await refreshMarketIntelligence(brandA.id);
      expect(res2.success).toBe(true);
      expect(res2.run?.id).toBe(runId);
      expect(res2.run?.status).toBe('QUEUED');

      // Verify audit logs were created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          organizationId: orgA.id,
          action: 'MARKET_INTELLIGENCE_REFRESH_REQUESTED',
          entityId: runId
        }
      });
      expect(auditLog).toBeDefined();
    });
  });

  describe('Insight Retrieval & Filtering', () => {
    beforeEach(async () => {
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue(true);

      // Seed mock insights
      await prisma.marketInsight.deleteMany({ where: { brandId: brandA.id } });
      await prisma.marketInsight.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          type: 'TREND',
          title: 'AI table ordering trends',
          summary: 'High interest in AI table ordering',
          source: 'Google Trends',
          relevanceScore: 85,
          confidence: 'HIGH',
        }
      });
      await prisma.marketInsight.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          type: 'RISK',
          title: 'Competitor price drop',
          summary: 'Competitor dropped price by 20%',
          source: 'Competitor Feed',
          relevanceScore: 70,
          confidence: 'MEDIUM',
        }
      });
    });

    it('fetches all insights, applies search, relevance, and type filters', async () => {
      // Fetch all
      const all = await getMarketInsights({ brandId: brandA.id });
      expect(all).toHaveLength(2);

      // Filter by type
      const trends = await getMarketInsights({ brandId: brandA.id, type: 'TREND' });
      expect(trends).toHaveLength(1);
      expect(trends[0].title).toBe('AI table ordering trends');

      // Filter by relevance
      const highRelevance = await getMarketInsights({ brandId: brandA.id, minRelevance: 80 });
      expect(highRelevance).toHaveLength(1);
      expect(highRelevance[0].title).toBe('AI table ordering trends');

      // Search query
      const search = await getMarketInsights({ brandId: brandA.id, searchQuery: 'price' });
      expect(search).toHaveLength(1);
      expect(search[0].title).toBe('Competitor price drop');
    });
  });

  describe('Converting Opportunity to Content Idea (Strict Confirmation)', () => {
    let mockInsight: any;
    let strategy: any;
    let contentPlan: any;

    beforeEach(async () => {
      (requireAuth as any).mockResolvedValue({
        userId: userAdmin.id,
        organizationId: orgA.id,
        role: 'ADMIN'
      });
      (requirePermission as any).mockResolvedValue(true);

      // Seed strategy & content plan
      strategy = await prisma.strategy.create({
        data: {
          brand: { connect: { id: brandA.id } },
          organization: { connect: { id: orgA.id } },
          publicationStatus: 'ACTIVE',
          status: 'COMPLETED',
          version: 1,
          goal: { target: 'Increase brand awareness' },
          contentPillars: ['AI Innovations']
        }
      });

      contentPlan = await prisma.contentPlan.create({
        data: {
          brand: { connect: { id: brandA.id } },
          organization: { connect: { id: orgA.id } },
          strategy: { connect: { id: strategy.id } },
          status: 'COMPLETED'
        }
      });

      mockInsight = await prisma.marketInsight.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          type: 'CONTENT_OPPORTUNITY',
          title: 'GST Compliance Post',
          summary: 'Highlighting KOT compliance benefits',
          source: 'Tax Portal',
          relevanceScore: 90,
          confidence: 'HIGH',
          contentOpportunities: {
            title: 'Compliance is Easy with BhojAI',
            platform: 'Instagram',
            format: 'Infographic',
            hook: 'Struggling with new GST bills?',
            suggestedCta: 'Get Free Trial'
          }
        }
      });
    });

    it('creates a draft content item using the opportunity details and schedules it without generating text', async () => {
      const res = await useOpportunityInContent({
        insightId: mockInsight.id,
        scheduledDate: '2026-09-01',
        funnelStage: 'CONSIDERATION',
        contentPillar: 'GST Features'
      });

      expect(res.success).toBe(true);
      expect(res.item).toBeDefined();
      expect(res.item.title).toBe('Compliance is Easy with BhojAI');
      expect(res.item.platform).toBe('Instagram');
      expect(res.item.format).toBe('Infographic');
      expect(res.item.scheduledDate.toISOString()).toContain('2026-09-01');
      expect(res.item.status).toBe('DRAFT'); // Keeps it as draft for on-demand execution
      expect(res.item.source).toBe('AI_OPPORTUNITY');

      // Verify audit logs were created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          organizationId: orgA.id,
          action: 'CONTENT_ITEM_CREATED',
          entityId: res.item.id
        }
      });
      expect(auditLog).toBeDefined();
    });
  });
});
