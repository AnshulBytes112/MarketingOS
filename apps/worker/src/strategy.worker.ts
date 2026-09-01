import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { NewStrategySchema } from './strategy.schema';
import { randomUUID } from 'crypto';

const gateway = new ModelGateway();

export const strategyWorker = new Worker(
  'strategy',
  async (job) => {
    const { organizationId, brandId, strategyId, userId, source } = job.data;
    const requestId = randomUUID();
    const startTimeMs = performance.now();
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
      const dbStartTime = performance.now();
      // Group independent queries to parallelize DB fetches
      const maxPosts = parseInt(process.env.COMPETITOR_AI_MAX_POSTS || '20', 10);
      const [
        activeDna,
        brand,
        products,
        brandCompetitors,
        competitorAccounts,
        competitorPosts,
        aiRecommendations,
      ] = await Promise.all([
        prisma.brandDNAVersion.findFirst({
          where: {
            brandId,
            organizationId,
            publicationStatus: 'ACTIVE',
            status: 'COMPLETED',
          },
        }),
        prisma.brand.findUnique({
          where: { id: brandId, organizationId },
        }),
        prisma.brandProduct.findMany({
          where: { brandId, organizationId },
        }),
        prisma.brandCompetitor.findMany({
          where: { brandId, organizationId },
        }),
        prisma.competitorAccount.findMany({
          where: { brandId, organizationId },
        }),
        prisma.competitorPost.findMany({
          where: { brandId, organizationId },
          orderBy: { publishedAt: 'desc' },
          take: maxPosts,
        }),
        prisma.aIRecommendation.findMany({
          where: { brandId, organizationId },
        })
      ]);
      const dbPrepTimeMs = Math.round(performance.now() - dbStartTime);
      console.log(`[${requestId}] DB Prep took ${dbPrepTimeMs}ms`);

      // Compute deterministic data limitations
      let competitorDataAvailability: 'UNAVAILABLE' | 'WEBSITE_ONLY' | 'FULL' = 'UNAVAILABLE';
      if (competitorAccounts.length > 0) {
        const hasOfficial = competitorAccounts.some((a) => a.sourceType === 'OFFICIAL_API' && a.syncStatus === 'COMPLETED');
        const hasCompletedSync = competitorAccounts.some((a) => a.syncStatus === 'COMPLETED');
        if (hasOfficial) {
          competitorDataAvailability = 'FULL';
        } else if (hasCompletedSync) {
          competitorDataAvailability = 'WEBSITE_ONLY';
        }
      } else if (brandCompetitors && brandCompetitors.length > 0) {
        competitorDataAvailability = 'WEBSITE_ONLY';
      }

      const dataLimitations = {
        historicalPerformance: 'UNAVAILABLE',
        competitorData: competitorDataAvailability,
        audienceData: activeDna ? 'VALIDATED' : 'UNAVAILABLE',
        notes: [
          'Historical performance is completely UNAVAILABLE because no analytics integrations are connected.',
          competitorDataAvailability === 'UNAVAILABLE' 
            ? 'Competitor intelligence is completely UNAVAILABLE.' 
            : competitorDataAvailability === 'WEBSITE_ONLY'
              ? 'Competitor analysis is based solely on publicly available website/social scrape content (PUBLIC_WEB).'
              : 'Competitor analysis utilizes official APIs and ingestion sources.',
        ]
      };

      if (!activeDna) {
        throw new Error('INSUFFICIENT_DATA: No active Brand DNA exists for this brand.');
      }

      if (!brand) {
        throw new Error('Brand not found.');
      }

      // Maintain valid source IDs for anti-hallucination validation
      const validSourceIds = new Set([
        activeDna.id,
        brand.id,
        ...products.map((p) => p.id),
        ...brandCompetitors.map((bc) => bc.id),
        ...competitorAccounts.map((a) => a.id),
        ...competitorPosts.map((p) => p.id),
        ...aiRecommendations.map((r) => r.id),
      ]);

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

      let competitorAggregate = null;
      let competitorContext = null;

      if (competitorAccounts.length > 0 || brandCompetitors.length > 0) {
        let totalLikes = 0;
        let totalComments = 0;
        const platformCounts: Record<string, number> = {};
        
        competitorPosts.forEach(p => {
          platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
          totalLikes += p.likeCount || 0;
          totalComments += p.commentCount || 0;
        });
        
        const avgLikes = competitorPosts.length > 0 ? (totalLikes / competitorPosts.length).toFixed(1) : '0';
        const avgComments = competitorPosts.length > 0 ? (totalComments / competitorPosts.length).toFixed(1) : '0';

        competitorAggregate = {
          totalBrands: brandCompetitors.length,
          totalAccounts: competitorAccounts.length,
          analyzedPostsLimit: maxPosts,
          postsSelected: competitorPosts.length,
          platformDistribution: platformCounts,
          averageEngagement: {
            likes: avgLikes,
            comments: avgComments
          }
        };

        competitorContext = {
          brands: brandCompetitors.map((bc) => ({
            id: bc.id,
            name: bc.name,
            websiteUrl: bc.websiteUrl,
          })),
          accounts: competitorAccounts.map((a) => ({
            id: a.id,
            platform: a.platform,
            handle: a.handle,
            followerCount: a.followerCount,
          })),
          aggregateStats: competitorAggregate,
          posts: competitorPosts.map((p) => ({
            id: p.id,
            competitorAccountId: p.competitorAccountId,
            platform: p.platform,
            captionText: p.captionText ? p.captionText.substring(0, 150) : '',
            likeCount: p.likeCount,
            commentCount: p.commentCount,
            engagementRate: p.engagementRate,
          })),
        };
      }

      const recommendationsContext = aiRecommendations.map((r) => ({
        id: r.id,
        type: r.type,
        observation: r.observation,
        recommendation: r.recommendation,
      }));

      const systemPrompt = `You are a world-class Marketing Strategist AI. Generate an actionable, evidence-backed strategy.
      
LANGUAGE RULES:
- Use simple, concise, active language (e.g., "Build trust through evidence-based content").
- Avoid generic AI-sounding prose and excessive marketing jargon.
- Write as a senior strategist speaking directly to a marketing manager.

ANTI-HALLUCINATION RULES (CRITICAL):
- Do NOT invent or estimate baseline performance numbers, traffic, or engagement rates. If it's not provided, explicitly state it is unavailable.
- Do NOT fabricate source IDs. Every source ID in your response MUST exactly match the entity IDs provided in the context.
- Distinguish clearly between observed historical facts and proposed strategic hypotheses.

OUTPUT STRUCTURE RULES:
- Return a SINGLE flat JSON object conforming exactly to the schema.
- Data Limitations: You must return the EXACT dataLimitations object provided in the User Prompt.
- Content Mix: Allocations must sum exactly to 100%.
- Funnel Mapping: TOFU, MOFU, and BOFU recommendedAllocations must sum exactly to 100%.
- Platforms: Do not include a platform with 0% allocation unless its 'role' explicitly states it is 'Not recommended'.
- Experiments: Propose hypotheses (not guaranteed results) with metrics and test variables.
- Content Engine Contract: Ensure content pillars, themes, and formats are directly actionable by a downstream content generator.
- Sources: The top-level 'sources' array MUST be an array of objects containing { type, id, label }. Do not return an array of strings.
- Cadence: The 'cadence' field MUST be an array of objects containing { platform, cadence }. Do not return a string.`;

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

DATA LIMITATIONS (Include this EXACT object in your JSON output):
${JSON.stringify(dataLimitations, null, 2)}
`;

      const result = await gateway.generateStructured(
        null,
        systemPrompt,
        userPrompt,
        NewStrategySchema,
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
      
      // Validate anti-hallucination source IDs
      for (const src of result.data.sources) {
        if (!validSourceIds.has(src.id)) {
          throw new Error(`Fabricated source ID detected: ${src.id} (${src.label}). Only use provided entity IDs.`);
        }
      }
      for (const item of result.data.reasoning) {
        for (const srcId of item.sources) {
          if (!result.data.sources.some((s: any) => s.id === srcId)) {
            throw new Error(`Reasoning section "${item.section}" references source ID ${srcId} which is not present in the sources list.`);
          }
        }
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
            dataLimitations: result.data.dataLimitations,
            experiments: result.data.experiments,
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

      const totalDurationMs = Math.round(performance.now() - startTimeMs);
      console.log(`[${requestId}] Strategy generation completed successfully for strategy: ${strategyId} in ${totalDurationMs}ms`);

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
