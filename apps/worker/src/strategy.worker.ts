import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { StrategySchema } from './strategy.schema';
import { randomUUID } from 'crypto';

const gateway = new ModelGateway();

export const strategyWorker = new Worker(
  'strategy',
  async (job) => {
    const { organizationId, brandId, strategyId, userId, source } = job.data;
    const requestId = randomUUID();
    console.log(`[${requestId}] Processing Strategy generation job ${job.id} for strategy record: ${strategyId}`);

    // Load current strategy record
    const strategyRecord = await prisma.strategy.findUnique({
      where: { id: strategyId, organizationId, brandId },
    });

    if (!strategyRecord) {
      throw new Error(`Strategy record ${strategyId} not found.`);
    }

    // Verify it is in GENERATING state
    if (strategyRecord.status !== 'GENERATING') {
      console.warn(`[${requestId}] Strategy ${strategyId} is not in GENERATING state (current: ${strategyRecord.status}). Skipping.`);
      return;
    }

    try {
      // 1. Fetch active Brand DNA
      const activeDna = await prisma.brandDNAVersion.findFirst({
        where: {
          brandId,
          organizationId,
          publicationStatus: 'ACTIVE',
          status: 'COMPLETED',
        },
      });

      if (!activeDna) {
        throw new Error('INSUFFICIENT_DATA: No active Brand DNA exists for this brand.');
      }

      // 2. Fetch onboarding details
      const brand = await prisma.brand.findUnique({
        where: { id: brandId, organizationId },
      });

      if (!brand) {
        throw new Error('Brand not found.');
      }

      // 3. Fetch products
      const products = await prisma.brandProduct.findMany({
        where: { brandId, organizationId },
      });

      // 4. Fetch competitor accounts and posts
      const competitorAccounts = await prisma.competitorAccount.findMany({
        where: { brandId, organizationId },
      });

      const competitorPosts = await prisma.competitorPost.findMany({
        where: { brandId, organizationId },
        orderBy: { publishedAt: 'desc' },
        take: 30, // Limit context size
      });

      // 5. Fetch AI Recommendations
      const aiRecommendations = await prisma.aIRecommendation.findMany({
        where: { brandId, organizationId },
      });

      // Build context
      const brandDnaContext = {
        id: activeDna.id,
        personality: activeDna.personality,
        voice: activeDna.voice,
        tone: activeDna.tone,
        positioning: activeDna.positioning,
        audience: activeDna.audience,
        contentPillars: activeDna.contentPillars,
      };

      const onboardingContext = {
        id: brand.id,
        name: brand.name,
        industry: brand.industry || 'Unknown',
        targetAudience: brand.targetAudience || 'Unknown',
        geography: brand.geography || 'Unknown',
        priceSegment: brand.priceSegment || 'Unknown',
        positioning: brand.positioning || 'Unknown',
        usp: brand.usp || 'Unknown',
      };

      const productsContext = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
      }));

      const competitorContext = competitorAccounts.length > 0
        ? {
          accounts: competitorAccounts.map((a) => ({
            id: a.id,
            platform: a.platform,
            handle: a.handle,
            followerCount: a.followerCount,
          })),
          posts: competitorPosts.map((p) => ({
            id: p.id,
            competitorAccountId: p.competitorAccountId,
            platform: p.platform,
            captionText: p.captionText ? p.captionText.substring(0, 150) : '',
            likeCount: p.likeCount,
            commentCount: p.commentCount,
            engagementRate: p.engagementRate,
          })),
        }
        : null;

      const recommendationsContext = aiRecommendations.map((r) => ({
        id: r.id,
        type: r.type,
        observation: r.observation,
        recommendation: r.recommendation,
      }));

      const systemPrompt = `You are a world-class Marketing Strategist AI. Generate a comprehensive marketing Strategy based ONLY on the provided inputs.
You MUST trace all observations, decisions, and recommendations to the actual database entity IDs provided in the prompt.
Do not fabricate or invent IDs. Only use the IDs provided.

CRITICAL OUTPUT RULES:
- Return a SINGLE flat JSON object. Do NOT wrap it in any parent key (e.g. do NOT return {"strategy": {...}} or {"marketing_strategy": {...}}).
- The JSON object must start directly with these top-level keys: goal, audienceSegments, contentPillars, contentMix, funnelMapping, platformStrategy, formats, cadence, themes, campaignOpportunities, reasoning, sources.
- Do NOT add any extra keys or wrapper objects around the response.
- Under "sources", return an ARRAY of objects each with keys: type, id, label. Do NOT put strings in the sources array.
- Under "reasoning", each item must have: section, observation, evidence, reasoning, recommendation, sources (array of string IDs).
- Ensure that the allocations in "contentMix" sum to exactly 100%.
- Ensure that the allocations in "funnelMapping" (TOFU, MOFU, BOFU recommendedAllocation) sum to exactly 100%.`;

      const userPrompt = `
ACTIVE Brand DNA:
${JSON.stringify(brandDnaContext, null, 2)}

Brand Onboarding Information:
${JSON.stringify(onboardingContext, null, 2)}

Products / Services Catalog:
${JSON.stringify(productsContext, null, 2)}

Competitor Intelligence:
${competitorContext ? JSON.stringify(competitorContext, null, 2) : 'Competitor intelligence is completely UNAVAILABLE.'}

AI Recommendations:
${JSON.stringify(recommendationsContext, null, 2)}

Historical Performance:
Historical performance is completely UNAVAILABLE. Set historicalPerformanceAvailable = false.
`;

      const result = await gateway.generateStructured(
        null,
        systemPrompt,
        userPrompt,
        StrategySchema,
        'Strategy',
        'Structured marketing strategy data',
        requestId
      );

      // Record AI Usage
      await prisma.aIUsage.create({
        data: {
          organizationId,
          brandId,
          requestId,
          provider: process.env.AI_PROVIDER || 'openai',
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs,
          estimatedCost: result.usage.estimatedCost,
          status: 'SUCCESS',
        },
      });

      // Validate Allocations
      const contentMix = result.data.contentMix;
      const mixSum = contentMix.reduce((sum: number, item: any) => sum + item.percentage, 0);
      if (Math.abs(mixSum - 100) > 0.01) {
        throw new Error(`Content mix percentages must sum to 100%, got ${mixSum}%`);
      }

      const funnelMapping = result.data.funnelMapping;
      const funnelSum = (funnelMapping.TOFU?.recommendedAllocation || 0) +
        (funnelMapping.MOFU?.recommendedAllocation || 0) +
        (funnelMapping.BOFU?.recommendedAllocation || 0);
      if (Math.abs(funnelSum - 100) > 0.01) {
        throw new Error(`Funnel mapping allocations must sum to 100%, got ${funnelSum}%`);
      }

      // Save complete inside a transaction
      await prisma.$transaction(async (tx) => {
        // Mark previous active strategies as SUPERSEDED
        await tx.strategy.updateMany({
          where: {
            brandId,
            organizationId,
            publicationStatus: 'ACTIVE',
          },
          data: {
            publicationStatus: 'SUPERSEDED',
          },
        });

        // Mark this strategy as COMPLETED and ACTIVE
        await tx.strategy.update({
          where: { id: strategyId },
          data: {
            status: 'COMPLETED',
            publicationStatus: 'ACTIVE',
            completedAt: new Date(),
            goal: result.data.goal,
            audienceSegments: result.data.audienceSegments,
            contentPillars: result.data.contentPillars,
            contentMix: result.data.contentMix,
            funnelMapping: result.data.funnelMapping,
            platformStrategy: result.data.platformStrategy,
            formats: result.data.formats,
            cadence: result.data.cadence,
            themes: result.data.themes,
            campaignOpportunities: result.data.campaignOpportunities,
            reasoning: result.data.reasoning,
            sources: result.data.sources,
          },
        });
      });

      // Log success audit
      if (userId) {
        await prisma.auditLog.create({
          data: {
            organizationId,
            userId,
            action: 'STRATEGY_GENERATED',
            entityType: 'Strategy',
            entityId: strategyId,
            metadata: {
              version: strategyRecord.version,
              source: source || 'MANUAL',
              requestId,
            },
          },
        });
      }

      console.log(`[${requestId}] Strategy generation completed successfully for strategy: ${strategyId}`);

    } catch (error: any) {
      console.error(`[${requestId}] Strategy generation failed for strategy: ${strategyId}`, error);

      // Mark strategy as FAILED
      await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 1,
    lockDuration: 300000, // 5 minutes — prevents stall detection on long AI calls
    maxStalledCount: 1,
  }
);

strategyWorker.on('failed', (job, err) => {
  console.error(`Strategy Job ${job?.id} failed:`, err.message);
});

strategyWorker.on('stalled', async (jobId) => {
  console.error(`Strategy Job ${jobId} stalled. Marking strategy as FAILED in DB.`);
  try {
    // Find strategy records stuck in GENERATING and mark them failed
    await prisma.strategy.updateMany({
      where: { status: 'GENERATING' },
      data: { status: 'FAILED', completedAt: new Date() },
    });
  } catch (e) {
    console.error('Failed to reset stalled strategy in DB:', e);
  }
});

strategyWorker.on('ready', () => {
  console.log('strategyWorker is READY and listening for jobs on strategy queue!');
});
