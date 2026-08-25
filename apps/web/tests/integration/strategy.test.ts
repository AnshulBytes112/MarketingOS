import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { prisma } from '@abge/database';
import type { Organization, Brand, User, AIRecommendation, BrandCompetitor } from '@prisma/client';
import { requirePermission, requireAuth } from '@abge/auth';
import {
  getActiveStrategy,
  getStrategyGenerationStatus,
  regenerateStrategy,
  applyRecommendationToStrategyAction,
  approveStrategy,
  generateContentCalendar,
} from '../../src/app/(dashboard)/strategy/actions';
import { StrategyIntegrationBoundary } from '../../src/lib/strategy-boundary';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/queue', () => ({
  enqueueStrategyGeneration: vi.fn().mockResolvedValue(true),
  enqueueContentPlanGeneration: vi.fn().mockResolvedValue(true),
}));

vi.mock('@abge/auth', () => ({
  requirePermission: vi.fn(),
  requireAuth: vi.fn(),
  getCurrentSession: vi.fn(),
}));

describe('Strategy Engine Integration Tests (REAL DB)', () => {
  let orgA: Organization;
  let orgB: Organization;
  let brandA: Brand;
  let brandB: Brand;
  let userA: User;
  let userB: User;
  let competitorA: BrandCompetitor;
  let recA: AIRecommendation;

  beforeAll(async () => {
    // Setup Tenant A
    orgA = await prisma.organization.upsert({
      where: { slug: 'test-org-strategy-a' },
      update: {},
      create: { name: 'Test Org Strategy A', slug: 'test-org-strategy-a' },
    });
    userA = await prisma.user.upsert({
      where: { email: 'user-a@test.com' },
      update: {},
      create: { email: 'user-a@test.com', name: 'User A' },
    });
    brandA = await prisma.brand.create({
      data: { name: 'Brand A', organizationId: orgA.id },
    });

    // Create competitor for Tenant A
    competitorA = await prisma.brandCompetitor.create({
      data: {
        organizationId: orgA.id,
        brandId: brandA.id,
        name: 'Competitor A',
        websiteUrl: 'competitor-a.com',
      },
    });

    // Setup Tenant B
    orgB = await prisma.organization.upsert({
      where: { slug: 'test-org-strategy-b' },
      update: {},
      create: { name: 'Test Org Strategy B', slug: 'test-org-strategy-b' },
    });
    userB = await prisma.user.upsert({
      where: { email: 'user-b@test.com' },
      update: {},
      create: { email: 'user-b@test.com', name: 'User B' },
    });
    brandB = await prisma.brand.create({
      data: { name: 'Brand B', organizationId: orgB.id },
    });

    // Create a recommendation for Tenant A
    recA = await prisma.aIRecommendation.create({
      data: {
        organizationId: orgA.id,
        brandId: brandA.id,
        competitorId: competitorA.id,
        type: 'CAMPAIGN_IDEA',
        observation: 'Competitor has high organic video engagement.',
        likelyCause: 'Algorithm bias towards video format.',
        recommendation: 'Launch a short-form video series about product development.',
        action: 'Launch short videos',
        confidence: 0.8,
        sources: [],
        status: 'OPEN',
      },
    });
  });

  afterAll(async () => {
    // Teardown Strategy Edits and Audit Logs first due to foreign keys
    await prisma.strategyEdit.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } },
    });
    await prisma.auditLog.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } },
    });
    await prisma.strategy.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } },
    });
    await prisma.aIRecommendation.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } },
    });
    await prisma.brandCompetitor.deleteMany({
      where: { organizationId: { in: [orgA.id, orgB.id] } },
    });
    await prisma.brand.deleteMany({
      where: { id: { in: [brandA.id, brandB.id] } },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgA.id, orgB.id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userA.id, userB.id] } },
    });
  });

  describe('RBAC Protection', () => {
    it('rejects VIEWER from regenerating strategy', async () => {
      (requirePermission as any).mockImplementation((perm: string) => {
        if (perm === 'manage_strategy') {
          throw new Error('FORBIDDEN');
        }
        return Promise.resolve({ userId: userA.id, organizationId: orgA.id, role: 'VIEWER' });
      });

      await expect(regenerateStrategy(brandA.id)).rejects.toThrow('FORBIDDEN');
    });

    it('rejects VIEWER from applying recommendations', async () => {
      (requirePermission as any).mockImplementation((perm: string) => {
        if (perm === 'manage_strategy') {
          throw new Error('FORBIDDEN');
        }
        return Promise.resolve({ userId: userA.id, organizationId: orgA.id, role: 'VIEWER' });
      });

      const op = {
        operation: 'ADD_CAMPAIGN_OPPORTUNITY',
        payload: {
          name: 'Video Campaign',
          objective: 'Boost TOFU engagement',
          audience: 'Tech professionals',
          funnelStage: 'TOFU',
          suggestedPlatforms: ['Instagram'],
          suggestedFormats: ['Reel'],
          rationale: 'High video engagement observed',
        },
      };

      await expect(applyRecommendationToStrategyAction(recA.id, op)).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('Tenant Isolation', () => {
    beforeEach(() => {
      // Mock session for User A in Org A
      (requireAuth as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });
      (requirePermission as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });
    });

    it('rejects accessing Brand B via Org A session', async () => {
      await expect(getActiveStrategy(brandB.id)).rejects.toThrow('Brand not found or access denied');
    });

    it('rejects regenerating Strategy for Brand B via Org A session', async () => {
      await expect(regenerateStrategy(brandB.id)).rejects.toThrow('Brand not found or access denied');
    });

    it('rejects applying recommendation of Org A to Org B strategy', async () => {
      // Create active strategy for Brand B (Org B)
      const stratB = await prisma.strategy.create({
        data: {
          organizationId: orgB.id,
          brandId: brandB.id,
          version: 1,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          goal: { primaryGoal: 'Grow Brand B' },
        },
      });

      const op = {
        operation: 'ADD_CAMPAIGN_OPPORTUNITY',
        payload: {
          name: 'Video Campaign',
          objective: 'Boost TOFU engagement',
          audience: 'Tech professionals',
          funnelStage: 'TOFU',
          suggestedPlatforms: ['Instagram'],
          suggestedFormats: ['Reel'],
          rationale: 'High video engagement observed',
        },
      };

      // Try to call apply action with recommendation A (belongs to Org A)
      // but session is Org B!
      (requirePermission as any).mockResolvedValue({
        userId: userB.id,
        organizationId: orgB.id,
        role: 'ADMIN',
      });

      await expect(applyRecommendationToStrategyAction(recA.id, op)).rejects.toThrow(
        'Recommendation not found or access denied'
      );

      // Clean up stratB
      await prisma.strategy.delete({ where: { id: stratB.id } });
    });
  });

  describe('Concurrency & Version Lifecycle', () => {
    beforeEach(() => {
      (requireAuth as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });
      (requirePermission as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });
    });

    it('prevents concurrent generation requests', async () => {
      // Create a strategy in GENERATING status
      const generatingStrat = await prisma.strategy.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          version: 1,
          status: 'GENERATING',
          publicationStatus: 'DRAFT',
        },
      });

      // Try to regenerate again
      const res = await regenerateStrategy(brandA.id);
      expect(res.success).toBe(false);
      expect(res.error).toBe('GENERATION_ALREADY_IN_PROGRESS');

      // Cleanup
      await prisma.strategy.delete({ where: { id: generatingStrat.id } });
    });

    it('creates next version incrementally and enqueues job', async () => {
      // Create first completed version
      const v1 = await prisma.strategy.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          version: 1,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
        },
      });

      const res = await regenerateStrategy(brandA.id);
      expect(res.success).toBe(true);
      expect(res.strategy).toBeDefined();
      expect(res.strategy?.version).toBe(2);
      expect(res.strategy?.status).toBe('GENERATING');
      expect(res.strategy?.publicationStatus).toBe('DRAFT');

      // Cleanup
      await prisma.strategy.deleteMany({
        where: { id: { in: [v1.id, res.strategy!.id] } },
      });
    });
  });

  describe('Apply-to-Strategy Mutations & Transaction Integrity', () => {
    let activeStratA: any;

    beforeEach(async () => {
      (requirePermission as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });

      // Ensure active strategy exists for Brand A
      activeStratA = await prisma.strategy.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          version: 1,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          goal: { primaryGoal: 'Build Brand A' },
          campaignOpportunities: [],
          contentMix: [
            { category: 'Educational', percentage: 40, rationale: 'Learn' },
            { category: 'Promotional', percentage: 30, rationale: 'Buy' },
            { category: 'Community', percentage: 30, rationale: 'Belong' },
          ],
        },
      });
    });

    afterEach(async () => {
      await prisma.strategyEdit.deleteMany({ where: { strategyId: activeStratA.id } });
      await prisma.auditLog.deleteMany({ where: { entityId: activeStratA.id } });
      await prisma.strategy.deleteMany({ where: { id: activeStratA.id } });
      
      // Reset recommendation status to OPEN
      await prisma.aIRecommendation.update({
        where: { id: recA.id },
        data: { status: 'OPEN' },
      });
    });

    it('successfully applies a valid campaign opportunity and logs it', async () => {
      const op = {
        operation: 'ADD_CAMPAIGN_OPPORTUNITY',
        payload: {
          name: 'Video Launch Campaign',
          objective: 'Demonstrate USP via short videos',
          audience: 'General users',
          funnelStage: 'TOFU',
          suggestedPlatforms: ['Instagram'],
          suggestedFormats: ['Reels'],
          rationale: 'Observation of competitor engagement patterns',
        },
      };

      const res = await applyRecommendationToStrategyAction(recA.id, op);
      expect(res.success).toBe(true);

      // Verify Strategy record was updated
      const updatedStrat = await prisma.strategy.findUnique({
        where: { id: activeStratA.id },
      });
      const campaigns = updatedStrat?.campaignOpportunities as any[];
      expect(campaigns).toHaveLength(1);
      expect(campaigns[0].name).toBe('Video Launch Campaign');

      // Verify StrategyEdit was created
      const edits = await prisma.strategyEdit.findMany({
        where: { strategyId: activeStratA.id },
      });
      expect(edits).toHaveLength(1);
      expect(edits[0].field).toBe('campaignOpportunities');
      expect(edits[0].recommendationId).toBe(recA.id);

      // Verify AIRecommendation is APPLIED
      const updatedRec = await prisma.aIRecommendation.findUnique({
        where: { id: recA.id },
      });
      expect(updatedRec?.status).toBe('APPLIED');
    });

    it('enforces that Content Mix updates must sum to exactly 100%', async () => {
      const invalidOp = {
        operation: 'UPDATE_CONTENT_MIX',
        payload: [
          { category: 'Educational', percentage: 50, rationale: 'Learn more' },
          { category: 'Promotional', percentage: 20, rationale: 'Buy less' },
        ], // Sum = 70%
      };

      await expect(applyRecommendationToStrategyAction(recA.id, invalidOp)).rejects.toThrow(
        'Content mix percentages must sum to 100%, got 70%'
      );

      // Verify strategy remains unchanged
      const updatedStrat = await prisma.strategy.findUnique({
        where: { id: activeStratA.id },
      });
      expect((updatedStrat?.contentMix as any[])[0].percentage).toBe(40);

      // Verify recommendation is still OPEN
      const updatedRec = await prisma.aIRecommendation.findUnique({
        where: { id: recA.id },
      });
      expect(updatedRec?.status).toBe('OPEN');
    });
  });

  describe('Boundary Integration', () => {
    let activeStratA: any;

    beforeEach(async () => {
      // Setup active session mocking for boundary getCurrentSession call
      const { getCurrentSession } = await import('@abge/auth');
      (getCurrentSession as any).mockResolvedValue({
        userId: userA.id,
        organizationId: orgA.id,
        role: 'ADMIN',
      });

      activeStratA = await prisma.strategy.create({
        data: {
          organizationId: orgA.id,
          brandId: brandA.id,
          version: 1,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          goal: { primaryGoal: 'Build Brand A' },
          campaignOpportunities: [],
          contentPillars: [],
        },
      });
    });

    afterEach(async () => {
      await prisma.strategyEdit.deleteMany({ where: { strategyId: activeStratA.id } });
      await prisma.auditLog.deleteMany({ where: { entityId: activeStratA.id } });
      await prisma.strategy.deleteMany({ where: { id: activeStratA.id } });
      
      // Reset recommendation status to OPEN
      await prisma.aIRecommendation.update({
        where: { id: recA.id },
        data: { status: 'OPEN' },
      });
    });

    it('real apply mutation maps correctly and succeeds', async () => {
      const result = await StrategyIntegrationBoundary.applyRecommendationToStrategy({
        organizationId: orgA.id,
        brandId: brandA.id,
        recommendationId: recA.id,
        action: 'Launch Video Campaign',
        recommendation: 'Produce 10 short reels showcasing coffee origins.',
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe('SUCCESS');
      expect(result.strategyRecordId).toBe(activeStratA.id);

      // Verify recommendation is APPLIED
      const updatedRec = await prisma.aIRecommendation.findUnique({
        where: { id: recA.id },
      });
      expect(updatedRec?.status).toBe('APPLIED');
    });

    it('returns error if no active strategy exists', async () => {
      // Delete active strategy
      await prisma.strategy.delete({ where: { id: activeStratA.id } });

      const result = await StrategyIntegrationBoundary.applyRecommendationToStrategy({
        organizationId: orgA.id,
        brandId: brandA.id,
        recommendationId: recA.id,
        action: 'Launch Video Campaign',
        recommendation: 'Produce 10 short reels showcasing coffee origins.',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe('NO_ACTIVE_STRATEGY');
    });
  });

  describe('Strategy Approval & Locking Lifecycle', () => {
    let lifecycleOrg: Organization;
    let lifecycleUser: User;
    let lifecycleBrand: Brand;
    let lifecycleCompetitor: BrandCompetitor;
    let lifecycleRec: AIRecommendation;
    let testStrat: any;

    beforeAll(async () => {
      lifecycleOrg = await prisma.organization.create({
        data: { name: 'Lifecycle Org', slug: 'lifecycle-org-' + Date.now() },
      });
      lifecycleUser = await prisma.user.create({
        data: { email: 'user-lifecycle-' + Date.now() + '@test.com', name: 'Lifecycle User' },
      });
      lifecycleBrand = await prisma.brand.create({
        data: { name: 'Lifecycle Brand', organizationId: lifecycleOrg.id },
      });
      lifecycleCompetitor = await prisma.brandCompetitor.create({
        data: {
          organizationId: lifecycleOrg.id,
          brandId: lifecycleBrand.id,
          name: 'Lifecycle Competitor',
          websiteUrl: 'competitor-lifecycle.com',
        },
      });
      lifecycleRec = await prisma.aIRecommendation.create({
        data: {
          organizationId: lifecycleOrg.id,
          brandId: lifecycleBrand.id,
          competitorId: lifecycleCompetitor.id,
          type: 'CAMPAIGN_IDEA',
          observation: 'Competitor has high organic video engagement.',
          likelyCause: 'Algorithm bias towards video format.',
          recommendation: 'Launch a short-form video series about product development.',
          action: 'Launch short videos',
          confidence: 0.8,
          sources: [],
          status: 'OPEN',
        },
      });
    });

    afterAll(async () => {
      // Clean up relations
      await prisma.contentItem.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.contentPlan.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.auditLog.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.strategy.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.aIRecommendation.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.brandCompetitor.deleteMany({
        where: { organizationId: lifecycleOrg.id },
      });
      await prisma.brand.deleteMany({
        where: { id: lifecycleBrand.id },
      });
      await prisma.organization.deleteMany({
        where: { id: lifecycleOrg.id },
      });
      await prisma.user.deleteMany({
        where: { id: lifecycleUser.id },
      });
    });

    beforeEach(async () => {
      // Create a test strategy in active state
      testStrat = await prisma.strategy.create({
        data: {
          organizationId: lifecycleOrg.id,
          brandId: lifecycleBrand.id,
          version: 2,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          goal: { primaryGoal: 'Build Brand A' },
          campaignOpportunities: [],
          contentPillars: [],
        },
      });
    });

    afterEach(async () => {
      await prisma.contentItem.deleteMany({
        where: { strategyId: testStrat.id },
      });
      await prisma.contentPlan.deleteMany({
        where: { strategyId: testStrat.id },
      });
      await prisma.auditLog.deleteMany({
        where: { entityId: testStrat.id },
      });
      await prisma.strategy.deleteMany({
        where: { id: testStrat.id },
      });
    });

    it('allows OWNER or APPROVER to approve strategy, locks it and registers audit logs', async () => {
      (requirePermission as any).mockResolvedValue({
        userId: lifecycleUser.id,
        organizationId: lifecycleOrg.id,
        role: 'OWNER',
      });

      const res = await approveStrategy(lifecycleBrand.id, testStrat.id);
      expect(res.success).toBe(true);
      expect(res.strategy.approvalStatus).toBe('APPROVED');
      expect(res.strategy.lockedAt).not.toBeNull();

      // Check Audit Log
      const logs = await prisma.auditLog.findMany({
        where: { entityId: testStrat.id },
      });
      expect(logs).toHaveLength(2);
      expect(logs.map(l => l.action)).toContain('STRATEGY_APPROVED');
      expect(logs.map(l => l.action)).toContain('STRATEGY_LOCKED');
    });

    it('rejects VIEWER or other roles without permission', async () => {
      (requirePermission as any).mockImplementation((perm: string) => {
        if (perm === 'approve_content') {
          throw new Error('FORBIDDEN');
        }
        return Promise.resolve({ userId: lifecycleUser.id, organizationId: lifecycleOrg.id, role: 'VIEWER' });
      });

      await expect(approveStrategy(lifecycleBrand.id, testStrat.id)).rejects.toThrow('FORBIDDEN');
    });

    it('prevents mutations on approved strategies', async () => {
      // Mark as approved first
      await prisma.strategy.update({
        where: { id: testStrat.id },
        data: { approvalStatus: 'APPROVED', lockedAt: new Date() },
      });

      (requirePermission as any).mockResolvedValue({
        userId: lifecycleUser.id,
        organizationId: lifecycleOrg.id,
        role: 'OWNER',
      });

      // Try regeneration
      const regenRes = await regenerateStrategy(lifecycleBrand.id);
      expect(regenRes.success).toBe(false);
      expect(regenRes.error).toBe('STRATEGY_LOCKED');

      // Try applying recommendation via boundary
      const boundaryRes = await StrategyIntegrationBoundary.applyRecommendationToStrategy({
        organizationId: lifecycleOrg.id,
        brandId: lifecycleBrand.id,
        recommendationId: lifecycleRec.id,
        action: 'Launch Video Campaign',
        recommendation: 'Produce short videos.',
      });
      expect(boundaryRes.success).toBe(false);
      expect(boundaryRes.error).toBe('STRATEGY_LOCKED');
    });

    it('handles calendar generation enqueuing correctly', async () => {
      // Must be approved first
      await prisma.strategy.update({
        where: { id: testStrat.id },
        data: { approvalStatus: 'APPROVED', lockedAt: new Date() },
      });

      (requirePermission as any).mockResolvedValue({
        userId: lifecycleUser.id,
        organizationId: lifecycleOrg.id,
        role: 'OWNER',
      });

      const calRes = await generateContentCalendar(testStrat.id);
      expect(calRes.success).toBe(true);
      expect(calRes.contentPlanId).toBeDefined();

      // Check ContentPlan created
      const plan = await prisma.contentPlan.findUnique({
        where: { id: calRes.contentPlanId },
      });
      expect(plan).toBeDefined();
      expect(plan?.status).toBe('GENERATING');
    });
  });
});
