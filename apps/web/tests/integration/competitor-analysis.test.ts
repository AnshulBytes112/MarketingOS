/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@abge/database';
import { Role } from '@prisma/client';
import * as headers from 'next/headers';
import bcrypt from 'bcryptjs';

// Import providers and worker logic
import { GenericWebsiteProvider } from '../../../worker/src/ingestion/website';
import { InstagramProvider } from '../../../worker/src/ingestion/social';
import { getProvider } from '../../../worker/src/ingestion/registry';
import { initializeScheduler } from '../../../worker/src/scheduler';

// Import server actions and boundary
import { 
  manuallyIngestPost, 
  generateCompetitorAnalysis, 
  applyRecommendation, 
  syncCompetitorNow 
} from '../../src/app/(dashboard)/competitors/[id]/actions';
import { StrategyIntegrationBoundary } from '../../src/lib/strategy-boundary';

// Mock cookies for requireAuth
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock ModelGateway to avoid external network requests to OpenAI during tests
vi.mock('../../../worker/src/ai/gateway', () => {
  return {
    ModelGateway: class {
      async generateStructured(
        modelOverride: any,
        systemPrompt: string,
        userPrompt: string,
        schema: any,
        schemaName: string,
        schemaDescription: string,
        requestId: string
      ) {
        return {
          data: {
            recommendations: [
              {
                type: 'CONTENT_GAP',
                observation: 'Competitor post frequency on website is high, focusing heavily on Product tutorials.',
                likelyCause: 'Competitor is trying to capture top-of-funnel customer intent via organic SEO guides.',
                recommendation: 'Create a tutorial hub focusing on our unique USP.',
                action: 'Write 3 blog posts on product setup this week.',
                confidence: 0.9,
                sourcePostUrls: ['https://instagram.com/p/C_abc123'],
              }
            ]
          },
          usage: {
            inputTokens: 10,
            outputTokens: 20,
            totalTokens: 30,
            latencyMs: 10,
            estimatedCost: 0.0001
          }
        };
      }
    }
  };
});

describe('Competitor Analysis & Ingestion Integration Suite', () => {
  let orgId: string;
  let brandId: string;
  let userId: string;
  
  let otherOrgId: string;
  let otherBrandId: string;
  let otherUserId: string;

  let sessionToken: string;
  let otherSessionToken: string;
  
  let competitorId: string;
  let emptyCompetitorId: string;
  let otherCompetitorId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create primary tenant organization, user, session, brand
    const org = await prisma.organization.create({
      data: { name: 'Tenant A', slug: 'tenant-a-' + Date.now(), status: 'ACTIVE' },
    });
    orgId = org.id;

    const user = await prisma.user.create({
      data: { email: 'owner-a@tenant.com', name: 'Owner A', passwordHash },
    });
    userId = user.id;

    await prisma.organizationMember.create({
      data: { organizationId: orgId, userId, role: Role.OWNER },
    });

    const session = await prisma.session.create({
      data: {
        sessionToken: 'session-tenant-a-' + Date.now(),
        userId,
        activeOrganizationId: orgId,
        expiresAt: new Date(Date.now() + 10000000),
      }
    });
    sessionToken = session.sessionToken;

    const brand = await prisma.brand.create({
      data: {
        organizationId: orgId,
        name: 'Brand A Coffee',
        industry: 'Beverages',
        onboardingStatus: 'ACTIVE',
      }
    });
    brandId = brand.id;

    // Create Competitor for Tenant A
    const competitor = await prisma.brandCompetitor.create({
      data: {
        organizationId: orgId,
        brandId,
        name: 'Competitor A',
        websiteUrl: 'nike.com', // used to test provider scrape
        instagram: 'nike_insta',
      }
    });
    competitorId = competitor.id;

    const emptyCompetitor = await prisma.brandCompetitor.create({
      data: {
        organizationId: orgId,
        brandId,
        name: 'Empty Competitor A',
        websiteUrl: 'empty.com',
      }
    });
    emptyCompetitorId = emptyCompetitor.id;

    // 2. Create secondary tenant organization (for cross-tenant checks)
    const otherOrg = await prisma.organization.create({
      data: { name: 'Tenant B', slug: 'tenant-b-' + Date.now(), status: 'ACTIVE' },
    });
    otherOrgId = otherOrg.id;

    const otherUser = await prisma.user.create({
      data: { email: 'owner-b@tenant.com', name: 'Owner B', passwordHash },
    });
    otherUserId = otherUser.id;

    await prisma.organizationMember.create({
      data: { organizationId: otherOrgId, userId: otherUserId, role: Role.OWNER },
    });

    const otherSession = await prisma.session.create({
      data: {
        sessionToken: 'session-tenant-b-' + Date.now(),
        userId: otherUserId,
        activeOrganizationId: otherOrgId,
        expiresAt: new Date(Date.now() + 10000000),
      }
    });
    otherSessionToken = otherSession.sessionToken;

    const otherBrand = await prisma.brand.create({
      data: {
        organizationId: otherOrgId,
        name: 'Brand B Coffee',
        industry: 'Beverages',
        onboardingStatus: 'ACTIVE',
      }
    });
    otherBrandId = otherBrand.id;

    // Create Competitor for Tenant B
    const otherCompetitor = await prisma.brandCompetitor.create({
      data: {
        organizationId: otherOrgId,
        brandId: otherBrandId,
        name: 'Competitor B',
        websiteUrl: 'adidas.com',
      }
    });
    otherCompetitorId = otherCompetitor.id;
  });

  afterAll(async () => {
    // Teardown
    await prisma.aIRecommendation.deleteMany({});
    await prisma.competitorPost.deleteMany({});
    await prisma.competitorAccount.deleteMany({});
    await prisma.brandCompetitor.deleteMany({});
    await prisma.brandDNAVersion.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.organizationMember.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.auditLog.deleteMany({});
  });

  const mockCookies = (token: string | null) => {
    vi.mocked(headers.cookies).mockResolvedValue({
      get: (name: string) => {
        if (name === 'abge_session' && token) return { value: token, name };
        return undefined;
      },
      set: vi.fn(),
      delete: vi.fn(),
    } as any);
  };

  describe('1. Ingestion Providers & Scrapers', () => {
    it('GenericWebsiteProvider should report AVAILABLE and scrape successfully', async () => {
      const provider = new GenericWebsiteProvider();
      expect(provider.getState()).toBe('AVAILABLE');
      expect(provider.getPlatform()).toBe('website');

      // Fetch account details
      const accountInfo = await provider.fetchAccount('https://example.com');
      expect(accountInfo.platform).toBe('website');
      expect(accountInfo.displayName).toBeTruthy();
      expect(accountInfo.profileUrl).toBe('https://example.com');

      // Fetch posts
      const posts = await provider.fetchRecentPosts('https://example.com');
      expect(posts.length).toBeGreaterThanOrEqual(1);
      expect(posts[0].externalPostId).toBeTruthy();
    });

    it('InstagramProvider should report AUTH_REQUIRED and reject fetch requests', async () => {
      const provider = new InstagramProvider();
      expect(provider.getState()).toBe('AUTH_REQUIRED');
      expect(provider.getPlatform()).toBe('instagram');

      await expect(provider.fetchAccount('nike')).rejects.toThrow('Authentication required');
    });

    it('registry should resolve correct provider instances', () => {
      const website = getProvider('website');
      expect(website).toBeInstanceOf(GenericWebsiteProvider);

      const instagram = getProvider('instagram');
      expect(instagram).toBeInstanceOf(InstagramProvider);

      const unknown = getProvider('non-existent');
      expect(unknown).toBeNull();
    });
  });

  describe('2. Ingest Scheduler Initialization', () => {
    it('initializeScheduler registers repeatable job cleanly', async () => {
      await expect(initializeScheduler()).resolves.not.toThrow();
    });
  });

  describe('3. Manual Ingestion & Persistence', () => {
    it('allows manually saving a post and updates competitor account stats', async () => {
      mockCookies(sessionToken);

      const result = await manuallyIngestPost(competitorId, brandId, {
        platform: 'instagram',
        url: 'https://instagram.com/p/C_abc123',
        publishedAt: new Date().toISOString(),
        captionText: 'New coffee flavor launch!',
        likeCount: 50,
        commentCount: 10,
        shareCount: 5,
        viewCount: 0,
      });

      expect(result.success).toBe(true);
      expect(result.post.id).toBeTruthy();
      expect(result.post.captionText).toBe('New coffee flavor launch!');

      // Check DB values
      const post = await prisma.competitorPost.findUnique({
        where: { id: result.post.id }
      });
      expect(post?.sourceType).toBe('MANUAL');
      expect(post?.likeCount).toBe(50);

      // Verify CompetitorAccount stats updated
      const account = await prisma.competitorAccount.findFirst({
        where: { competitorId, platform: 'instagram' }
      });
      expect(account?.postCount).toBe(1);
      expect(account?.sourceType).toBe('MANUAL');
    });
  });

  describe('4. Brand DNA Gating Check', () => {
    it('generateCompetitorAnalysis fails with INSUFFICIENT_DATA if no active Brand DNA exists', async () => {
      mockCookies(sessionToken);

      const result = await generateCompetitorAnalysis(competitorId, brandId);
      expect(result.success).toBe(false);
      expect(result.code).toBe('INSUFFICIENT_DATA');
      expect(result.error).toContain('No active Brand DNA found');
    });

    it('generateCompetitorAnalysis fails with INSUFFICIENT_DATA if there are no posts in the feed', async () => {
      mockCookies(sessionToken);

      // Create Active Brand DNA version
      await prisma.brandDNAVersion.create({
        data: {
          organizationId: orgId,
          brandId,
          version: 1,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          source: 'ONBOARDING',
          personality: 'Friendly',
          voice: 'Casual',
          tone: 'Helpful',
          positioning: 'Premium coffee',
          visualIdentitySummary: 'Dark brown theme',
          audience: 'Professionals',
          contentPillars: ['Innovation', 'Sustainability'],
          language: 'en',
          ctaPreferences: 'Learn more',
          confidenceScore: 0.95,
        }
      });

      // Fetch emptyCompetitorId which has 0 posts
      const result = await generateCompetitorAnalysis(emptyCompetitorId, brandId);
      expect(result.success).toBe(false);
      expect(result.code).toBe('INSUFFICIENT_DATA');
      expect(result.error).toContain('No competitor data available');
    });
  });

  describe('5. AI Analysis & Recommendations', () => {
    it('runs analysis and creates recommendations with traced evidence', async () => {
      mockCookies(sessionToken);

      // We have active Brand DNA (v1) and 1 manual Instagram post from earlier tests
      const result = await generateCompetitorAnalysis(competitorId, brandId);
      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(1);

      const rec = result.recommendations![0];
      expect(rec.status).toBe('OPEN');
      expect(rec.observation).toBeTruthy();
      expect(rec.recommendation).toContain('tutorial');

      // Verify sources trace correctly
      const sources = rec.sources as any[];
      expect(sources).toHaveLength(2); // Brand DNA + Competitor Post
      
      const dnaSource = sources.find(s => s.type === 'BRAND_DNA');
      expect(dnaSource).toBeTruthy();
      expect(dnaSource.label).toContain('v1');

      const postSource = sources.find(s => s.type === 'COMPETITOR_POST');
      expect(postSource).toBeTruthy();
    });
  });

  describe('6. Strategy Boundary Integration', () => {
    it('applyRecommendation fails cleanly when Strategy is not implemented', async () => {
      mockCookies(sessionToken);

      // Find open recommendation
      const rec = await prisma.aIRecommendation.findFirst({
        where: { competitorId, status: 'OPEN' }
      });
      expect(rec).toBeTruthy();

      const result = await applyRecommendation(rec!.id, brandId);
      expect(result.success).toBe(false);
      expect(result.code).toBe('STRATEGY_NOT_AVAILABLE');
      expect(result.error).toContain('Strategy integration is not yet available');

      // Verify DB status remained OPEN
      const updatedRec = await prisma.aIRecommendation.findUnique({
        where: { id: rec!.id }
      });
      expect(updatedRec?.status).toBe('OPEN');
    });

    it('applyRecommendation succeeds and transitions status when Strategy availability is mocked', async () => {
      mockCookies(sessionToken);

      // Find open recommendation
      const rec = await prisma.aIRecommendation.findFirst({
        where: { competitorId, status: 'OPEN' }
      });

      // Enable Mock Strategy
      (globalThis as any).__mockStrategyAvailable = true;

      const result = await applyRecommendation(rec!.id, brandId);
      expect(result.success).toBe(true);

      // Verify DB status transitioned to APPLIED
      const updatedRec = await prisma.aIRecommendation.findUnique({
        where: { id: rec!.id }
      });
      expect(updatedRec?.status).toBe('APPLIED');

      // Verify Audit Log entry created
      const audit = await prisma.auditLog.findFirst({
        where: {
          organizationId: orgId,
          action: 'BRAND_RECOMMENDATION_APPLIED',
          entityId: rec!.id,
        }
      });
      expect(audit).toBeTruthy();

      // Clean up mock override
      delete (globalThis as any).__mockStrategyAvailable;
    });
  });

  describe('7. Security Boundaries & Tenant Isolation', () => {
    it('prevents Tenant B session from viewing Tenant A competitor details', async () => {
      mockCookies(otherSessionToken); // Session of Tenant B

      // Attempt to generate analysis on Competitor A (belongs to Tenant A) using Tenant B session
      await expect(generateCompetitorAnalysis(competitorId, otherBrandId)).rejects.toThrow();
    });

    it('prevents Tenant B session from applying Tenant A recommendations', async () => {
      mockCookies(otherSessionToken);

      const rec = await prisma.aIRecommendation.findFirst({
        where: { competitorId, brandId }
      });
      expect(rec).toBeTruthy();

      await expect(applyRecommendation(rec!.id, otherBrandId)).rejects.toThrow();
    });

    it('prevents Tenant B session from triggering sync on Tenant A competitors', async () => {
      mockCookies(otherSessionToken);

      await expect(syncCompetitorNow(competitorId, otherBrandId)).rejects.toThrow();
    });
  });
});
