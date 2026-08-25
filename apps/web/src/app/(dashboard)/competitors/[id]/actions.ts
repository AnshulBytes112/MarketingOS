'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TenantRepository } from '@abge/tenant';
import { requireAuth, requirePermission } from '@abge/auth';
import { prisma } from '@abge/database';
import { getCompetitorIngestionQueue } from '@/lib/queue';
import { StrategyIntegrationBoundary } from '@/lib/strategy-boundary';
import { ModelGateway } from '../../../../../../worker/src/ai/gateway';

// Input Schemas
const manualPostSchema = z.object({
  platform: z.enum(['website', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok']),
  url: z.string().trim().url('Invalid URL').or(z.literal('')),
  publishedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid published date',
  }),
  captionText: z.string().trim().min(1, 'Caption content is required'),
  likeCount: z.number().int().nonnegative().optional().default(0),
  commentCount: z.number().int().nonnegative().optional().default(0),
  shareCount: z.number().int().nonnegative().optional().default(0),
  viewCount: z.number().int().nonnegative().optional().default(0),
});

export async function getCompetitorDetails(competitorId: string, brandId: string) {
  const session = await requireAuth();

  // Verify Scope
  const competitor = await prisma.brandCompetitor.findFirst({
    where: {
      id: competitorId,
      brandId,
      organizationId: session.organizationId,
    },
  });

  if (!competitor) {
    throw new Error('Competitor not found or access denied');
  }

  const repo = new TenantRepository(session);
  const accounts = await repo.getCompetitorAccounts(competitorId);
  const posts = await repo.getCompetitorPosts(competitorId);
  const recommendations = await repo.getAIRecommendations(brandId);
  const filteredRecs = recommendations.filter(r => r.competitorId === competitorId);

  return {
    competitor,
    accounts,
    posts,
    recommendations: filteredRecs,
  };
}

export async function syncCompetitorNow(competitorId: string, brandId: string) {
  const session = await requirePermission('manage_competitors');

  // Verify Scope
  const competitor = await prisma.brandCompetitor.findFirst({
    where: {
      id: competitorId,
      brandId,
      organizationId: session.organizationId,
    },
  });

  if (!competitor) {
    throw new Error('Competitor not found or access denied');
  }

  // Determine active platform configurations
  const platforms: string[] = [];
  if (competitor.websiteUrl) platforms.push('website');
  if (competitor.instagram) platforms.push('instagram');
  if (competitor.linkedin) platforms.push('linkedin');
  if (competitor.twitter) platforms.push('twitter');
  if (competitor.youtube) platforms.push('youtube');
  if (competitor.tiktok) platforms.push('tiktok');

  if (platforms.length === 0) {
    throw new Error('No social media handles or websites configured to sync.');
  }

  // Update syncStatus of existing/new platforms to PENDING in the DB
  for (const plat of platforms) {
    await prisma.competitorAccount.upsert({
      where: {
        organizationId_competitorId_platform: {
          organizationId: session.organizationId,
          competitorId,
          platform: plat,
        },
      },
      create: {
        organizationId: session.organizationId,
        brandId,
        competitorId,
        platform: plat,
        handle: plat === 'website' ? competitor.websiteUrl! : (competitor as any)[plat] || 'handle',
        syncStatus: 'PENDING',
        sourceType: plat === 'website' ? 'PUBLIC_WEB' : 'OFFICIAL_API',
      },
      update: {
        syncStatus: 'PENDING',
      },
    });
  }

  // Enqueue job to background BullMQ worker
  const queue = getCompetitorIngestionQueue();
  await queue.add('competitor-ingestion.run', {
    organizationId: session.organizationId,
    brandId,
    competitorId,
    force: true,
  });

  revalidatePath(`/competitors/${competitorId}`);
  return { success: true };
}

export async function manuallyIngestPost(
  competitorId: string,
  brandId: string,
  rawData: z.infer<typeof manualPostSchema>
) {
  const session = await requirePermission('manage_competitors');
  const validated = manualPostSchema.parse(rawData);

  const repo = new TenantRepository(session);
  const post = await repo.createManualPost(competitorId, brandId, {
    platform: validated.platform,
    url: validated.url || undefined,
    publishedAt: new Date(validated.publishedAt),
    captionText: validated.captionText,
    likeCount: validated.likeCount,
    commentCount: validated.commentCount,
    shareCount: validated.shareCount,
    viewCount: validated.viewCount,
  });

  // Also update parent account stats
  const account = await prisma.competitorAccount.findFirst({
    where: {
      competitorId,
      platform: validated.platform,
      organizationId: session.organizationId,
    },
  });

  if (account) {
    const allPosts = await prisma.competitorPost.findMany({
      where: {
        competitorAccountId: account.id,
        organizationId: session.organizationId,
      },
    });

    await prisma.competitorAccount.update({
      where: { id: account.id },
      data: {
        postCount: allPosts.length,
        lastSyncedAt: new Date(),
      },
    });
  }

  revalidatePath(`/competitors/${competitorId}`);
  return { success: true, post };
}

// Zod schemas for AI structured output
const RecommendationSchema = z.object({
  type: z.string(),
  observation: z.string(),
  likelyCause: z.string(),
  recommendation: z.string(),
  action: z.string(),
  confidence: z.number(),
  sourcePostUrls: z.array(z.string()),
});

const RecommendationsListSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});

export async function generateCompetitorAnalysis(competitorId: string, brandId: string) {
  const session = await requirePermission('manage_competitors');

  // Verify competitor scope and ownership
  const competitor = await prisma.brandCompetitor.findFirst({
    where: {
      id: competitorId,
      brandId,
      organizationId: session.organizationId,
    },
  });

  if (!competitor) {
    throw new Error('Competitor not found or access denied');
  }

  const repo = new TenantRepository(session);

  // 1. Fetch active Brand DNA
  const activeDna = await repo.getActiveBrandDna(brandId);
  if (!activeDna) {
    return {
      success: false,
      code: 'INSUFFICIENT_DATA',
      error: 'No active Brand DNA found. Please complete and publish your Brand DNA onboarding before running competitor analysis.',
    };
  }

  // 2. Fetch competitor posts
  const posts = await repo.getCompetitorPosts(competitorId);
  if (posts.length === 0) {
    return {
      success: false,
      code: 'INSUFFICIENT_DATA',
      error: 'No competitor data available. Please manually ingest a post or run website sync first.',
    };
  }

  // 3. Calculate database-backed numerical observations to prevent AI hallucination
  const totalPosts = posts.length;
  const platformCounts: Record<string, number> = {};
  let totalLikes = 0;
  let totalComments = 0;

  for (const post of posts) {
    platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
    totalLikes += post.likeCount || 0;
    totalComments += post.commentCount || 0;
  }

  const averageLikes = totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : '0';
  const averageComments = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : '0';

  const observationsContext = `
Numerical Database Observations:
- Total analyzed competitor posts: ${totalPosts}
- Distribution by platform: ${JSON.stringify(platformCounts)}
- Average engagement metrics: ${averageLikes} average likes, ${averageComments} average comments.
`;

  // 4. Initialize Gateway and generate recommendations
  try {
    const gateway = new ModelGateway();
    const systemPrompt = `You are a strategic Brand Intelligence AI. Compare the competitor's social media/web footprint against the brand's active Brand DNA.
Identify critical content gaps, posting patterns, or opportunities.
You MUST output a single JSON object containing a "recommendations" key, which points to an array of recommendation objects.

Format:
{
  "recommendations": [
    {
      "type": "CONTENT_GAP" | "PERFORMANCE",
      "observation": "factual observation from database metrics",
      "likelyCause": "strategic reason for this observation",
      "recommendation": "concrete recommendation for the brand",
      "action": "specific action plan",
      "confidence": 0.0 to 1.0 (float),
      "sourcePostUrls": ["http://..."]
    }
  ]
}

You must strictly use facts from the provided inputs. Do not invent metrics or facts.`;

    const userPrompt = `
Active Brand DNA:
Pillars: ${JSON.stringify(activeDna.contentPillars)}
Positioning: ${activeDna.positioning}
Audience: ${activeDna.audience}
Voice: ${activeDna.voice}
Tone: ${activeDna.tone}
Avoid List: ${JSON.stringify(activeDna.avoidList)}

Competitor Content Metadata:
${observationsContext}

Recent Competitor Post Captions & URLs:
${posts.map(p => `- [${p.platform}] URL: ${p.url || 'No URL'}, Published: ${p.publishedAt.toISOString().split('T')[0]}, Caption: "${p.captionText || ''}"`).join('\n')}
`;

    const response = await gateway.generateStructured(
      null,
      systemPrompt,
      userPrompt,
      RecommendationsListSchema,
      'RecommendationsList',
      'List of strategic competitor content gap recommendations',
      `analysis-${competitorId}-${Date.now()}`
    );

    const generatedRecommendations = response.data.recommendations;

    // Delete existing open recommendations for this competitor to keep it clean
    await prisma.aIRecommendation.deleteMany({
      where: {
        competitorId,
        brandId,
        organizationId: session.organizationId,
        status: 'OPEN',
      },
    });

    const savedRecs = [];

    // Save recommendations with source mappings
    for (const rec of generatedRecommendations) {
      const matchedPosts = posts.filter(p => p.url && rec.sourcePostUrls.includes(p.url));

      const sources = [
        { type: 'BRAND_DNA', id: activeDna.id, label: `Active Brand DNA v${activeDna.version}` },
      ];

      for (const p of matchedPosts) {
        sources.push({
          type: 'COMPETITOR_POST',
          id: p.id,
          label: `Post on ${p.platform} (${p.publishedAt.toISOString().split('T')[0]})`,
          url: p.url,
        } as any);
      }

      const dbRec = await prisma.aIRecommendation.create({
        data: {
          organizationId: session.organizationId,
          brandId,
          competitorId,
          type: rec.type,
          observation: rec.observation,
          likelyCause: rec.likelyCause,
          recommendation: rec.recommendation,
          action: rec.action,
          confidence: rec.confidence,
          sources: sources as any,
          status: 'OPEN',
        },
      });
      savedRecs.push(dbRec);
    }

    revalidatePath(`/competitors/${competitorId}`);
    return { success: true, recommendations: savedRecs };

  } catch (err: any) {
    console.error('[GenerateAnalysis] ModelGateway failed:', err);
    return {
      success: false,
      code: 'AI_FAILURE',
      error: `AI analysis failed: ${err.message || 'Unknown error occurred in ModelGateway'}`,
    };
  }
}

export async function applyRecommendation(recommendationId: string, brandId: string) {
  const session = await requirePermission('manage_competitors');

  // Fetch recommendation and verify scope
  const recommendation = await prisma.aIRecommendation.findFirst({
    where: {
      id: recommendationId,
      brandId,
      organizationId: session.organizationId,
    },
  });

  if (!recommendation) {
    throw new Error('Recommendation not found or access denied');
  }

  // Call the Strategy Integration Boundary
  const result = await StrategyIntegrationBoundary.applyRecommendationToStrategy({
    organizationId: session.organizationId,
    brandId,
    recommendationId,
    action: recommendation.action,
    recommendation: recommendation.recommendation,
  });

  if (result.code === 'STRATEGY_NOT_AVAILABLE') {
    return {
      success: false,
      code: 'STRATEGY_NOT_AVAILABLE',
      error: 'Strategy integration is not yet available. The strategy domain consumer is pending implementation.',
    };
  }

  if (!result.success) {
    return {
      success: false,
      code: result.code,
      error: result.error || 'Failed to apply recommendation to Strategy.',
    };
  }

  // Only update to APPLIED if boundary succeeded
  await prisma.aIRecommendation.update({
    where: { id: recommendationId },
    data: { status: 'APPLIED' },
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'BRAND_RECOMMENDATION_APPLIED',
      entityType: 'AIRecommendation',
      entityId: recommendationId,
      metadata: {
        brandId,
        strategyRecordId: result.strategyRecordId,
      },
    },
  });

  revalidatePath(`/competitors`);
  return { success: true };
}
