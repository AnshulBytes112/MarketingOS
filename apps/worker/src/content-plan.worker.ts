import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { ContentPlanGenerationSchema } from './content-plan.schema';
import { randomUUID } from 'crypto';
import { ContentPlanStatus, ContentItemStatus } from '@abge/database';

const gateway = new ModelGateway();

export const contentPlanWorker = new Worker(
  'content-plan',
  async (job) => {
    const { organizationId, brandId, strategyId, userId } = job.data;
    const requestId = randomUUID();
    const startTimeMs = performance.now();
    console.log(`[${requestId}] Processing ContentPlan generation job ${job.id} for strategy: ${strategyId}`);

    // Fetch the content plan linked to this job if it was created
    // (Or find the one in GENERATING state for this strategy)
    const contentPlan = await prisma.contentPlan.findFirst({
      where: {
        organizationId,
        brandId,
        strategyId,
        status: ContentPlanStatus.GENERATING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!contentPlan) {
      console.warn(`[${requestId}] No active GENERATING ContentPlan found for strategy ${strategyId}. Skipping.`);
      return;
    }

    try {
      const dbStartTime = performance.now();
      const maxPosts = parseInt(process.env.COMPETITOR_AI_MAX_POSTS || '15', 10);
      
      const [
        strategy,
        activeDna,
        products,
        competitorPosts
      ] = await Promise.all([
        prisma.strategy.findFirst({
          where: {
            id: strategyId,
            organizationId,
            brandId,
            approvalStatus: 'APPROVED',
          },
        }),
        prisma.brandDNAVersion.findFirst({
          where: {
            brandId,
            organizationId,
            publicationStatus: 'ACTIVE',
            status: 'COMPLETED',
          },
        }),
        prisma.brandProduct.findMany({
          where: { brandId, organizationId },
        }),
        prisma.competitorPost.findMany({
          where: { brandId, organizationId },
          orderBy: { publishedAt: 'desc' },
          take: maxPosts,
        })
      ]);
      const dbPrepTimeMs = Math.round(performance.now() - dbStartTime);
      console.log(`[${requestId}] DB Prep took ${dbPrepTimeMs}ms`);

      // Build AI prompt contexts
      const brandDnaContext = activeDna ? {
        personality: activeDna.personality,
        voice: activeDna.voice,
        tone: activeDna.tone,
        positioning: activeDna.positioning,
        audience: activeDna.audience,
        contentPillars: activeDna.contentPillars,
      } : 'No active Brand DNA found.';

      const strategyContext = {
        goal: strategy.goal,
        audienceSegments: strategy.audienceSegments,
        contentPillars: strategy.contentPillars,
        contentMix: strategy.contentMix,
        funnelMapping: strategy.funnelMapping,
        platformStrategy: strategy.platformStrategy,
        formats: strategy.formats,
        cadence: strategy.cadence,
        themes: strategy.themes,
      };

      const productsContext = products.map((p) => ({
        name: p.name,
        description: p.description || '',
      }));

      if (!strategy) {
        throw new Error('Strategy not found, not approved, or access denied');
      }

      const platformCounts: Record<string, number> = {};
      competitorPosts.forEach(p => {
        platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
      });

      const competitorContext = {
        aggregateStats: {
          postsSelected: competitorPosts.length,
          platformDistribution: platformCounts,
        },
        posts: competitorPosts.map((p) => ({
          platform: p.platform,
          captionText: p.captionText ? p.captionText.substring(0, 100) : '',
        }))
      };

      const systemPrompt = `You are an expert Social Media Planner. Generate a detailed 14-day content calendar allocation (exactly 14 items) for the brand.
You MUST align the calendar items strictly with the approved Strategy's guidelines:
- Content pillars (must map to one of the content pillars in Strategy)
- Platform allocation (must use platforms defined in platformStrategy of the Strategy)
- Funnel mapping (must align with funnel stage allocations)
- Formats (must use formats defined in the Strategy)
- Themes (must draw inspiration from themes defined in the Strategy)

IMPORTANT:
- Historical performance analytics are completely UNAVAILABLE. Do not fabricate or invent any historical performance data.
- The dates must be sequential YYYY-MM-DD starting from tomorrow.
- Output the result strictly adhering to the requested JSON schema.`;

      const userPrompt = `
Approved Strategy parameters:
${JSON.stringify(strategyContext, null, 2)}

Active Brand DNA:
${JSON.stringify(brandDnaContext, null, 2)}

Products/Services:
${JSON.stringify(productsContext, null, 2)}

Competitor Context:
${JSON.stringify(competitorContext, null, 2)}

Historical Analytics Status:
UNAVAILABLE. No historical performance analytics are available for this brand.
`;

      const result = await gateway.generateStructured(
        null,
        systemPrompt,
        userPrompt,
        ContentPlanGenerationSchema,
        'ContentPlan',
        'Structured content calendar data',
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

      // Save generated items to database in a single transaction (idempotent)
      await prisma.$transaction(async (tx) => {
        // Delete any existing items for this ContentPlan (for idempotency on worker retry)
        await tx.contentItem.deleteMany({
          where: { contentPlanId: contentPlan.id },
        });

        // Map and insert new items
        const newItemsData = result.data.items.map((item: any, index: number) => {
          let date = new Date(item.scheduledDate);
          if (isNaN(date.getTime())) {
            // fallback if date parse fails
            date = new Date();
            date.setDate(date.getDate() + index + 1);
          }

          return {
            id: `${contentPlan.id}_${index}`,
            organizationId,
            brandId,
            strategyId,
            contentPlanId: contentPlan.id,
            title: item.title,
            platform: item.platform,
            format: item.format,
            scheduledDate: date,
            funnelStage: item.funnelStage,
            contentPillar: item.contentPillar,
            theme: item.theme || null,
            status: ContentItemStatus.DRAFT,
          };
        });

        await tx.contentItem.createMany({
          data: newItemsData,
        });

        // Set ContentPlan to COMPLETED
        await tx.contentPlan.update({
          where: { id: contentPlan.id },
          data: { status: ContentPlanStatus.COMPLETED },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            organizationId,
            userId: userId || 'SYSTEM',
            action: 'CALENDAR_GENERATION_COMPLETED',
            entityType: 'ContentPlan',
            entityId: contentPlan.id,
            metadata: {
              brandId,
              strategyId,
              itemCount: newItemsData.length,
            },
          },
        });
      });

      const totalDurationMs = Math.round(performance.now() - startTimeMs);
      console.log(`[${requestId}] Content plan generation completed successfully in ${totalDurationMs}ms. Generated ${result.data.items.length} items.`);

    } catch (error: any) {
      console.error(`[${requestId}] Content plan generation failed:`, error);

      // Set ContentPlan to FAILED and audit log
      try {
        await prisma.$transaction(async (tx) => {
          await tx.contentPlan.update({
            where: { id: contentPlan.id },
            data: { status: ContentPlanStatus.FAILED },
          });

          await tx.auditLog.create({
            data: {
              organizationId,
              userId: userId || 'SYSTEM',
              action: 'CALENDAR_GENERATION_FAILED',
              entityType: 'ContentPlan',
              entityId: contentPlan.id,
              metadata: {
                brandId,
                strategyId,
                error: error.message,
              },
            },
          });
        });
      } catch (err: any) {
        console.error(`Failed to record content plan FAILED status:`, err);
      }

      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

contentPlanWorker.on('failed', (job, err) => {
  console.error(`ContentPlan Job ${job?.id} failed:`, err.message);
});
