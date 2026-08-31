import { Worker, Job } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from '../ai/gateway';
import { StubMarketIntelligenceProvider } from './provider';
import { MarketIntelligenceContextBuilder } from './context';
import { z } from 'zod';

const ai = new ModelGateway();

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const MarketInsightSchema = z.object({
  type: z.enum([
    'TREND',
    'INDUSTRY_SIGNAL',
    'COMPETITOR_MOVEMENT',
    'AUDIENCE_SIGNAL',
    'OPPORTUNITY',
    'RISK',
    'CONTENT_OPPORTUNITY'
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().optional(),
  source: z.string().min(1),
  sourceUrl: z.string().optional(),
  relevanceScore: z.number().int().min(1).max(100),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  implications: z.string().min(1),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  contentOpportunities: z.object({
    title: z.string(),
    platform: z.string(),
    format: z.string(),
    hook: z.string(),
    suggestedCta: z.string()
  }).optional()
});

export const MarketAnalysisOutputSchema = z.object({
  insights: z.array(MarketInsightSchema)
});

export const marketIntelligenceWorker = new Worker('market-intelligence', async (job: Job) => {
  const { organizationId, brandId, runId, userId } = job.data;
  console.log(`[Market Intelligence] Processing job ${job.id} for run ${runId}`);

  // 1. Fetch the run record
  const run = await prisma.marketIntelligenceRun.findUnique({
    where: { id: runId }
  });

  if (!run || run.organizationId !== organizationId || run.brandId !== brandId) {
    console.error(`[Market Intelligence] Run ${runId} not found or tenant mismatch.`);
    return;
  }

  // Update status to ANALYZING
  await prisma.marketIntelligenceRun.update({
    where: { id: runId },
    data: { status: 'ANALYZING' }
  });

  try {
    // 2. Validate external provider
    const provider = new StubMarketIntelligenceProvider();
    const isConfigured = await provider.validate();
    if (!isConfigured) {
      console.log(`[Market Intelligence] Provider not configured. Completing run ${runId} as NOT_CONFIGURED.`);
      await prisma.marketIntelligenceRun.update({
        where: { id: runId },
        data: { status: 'NOT_CONFIGURED' }
      });
      return;
    }

    // 3. Compile first-party context
    const compiledContext = await MarketIntelligenceContextBuilder.build(brandId, organizationId);
    
    // 4. Fetch external signals from provider
    const externalData = await provider.fetchInsights(compiledContext.contextString);

    // 5. Invoke ModelGateway
    const systemPrompt = `You are a Senior Market Research Analyst and AI Brand Strategist.
Analyze the provided brand context (Brand DNA, goals, competitor activity, performance metrics, and SEO data) alongside external market signals.

Your task is to identify and synthesize actionable market insights, trends, competitor movements, risks, and content opportunities.

CRITICAL DATA HONESTY RULES:
1. Do not invent fictional facts about the brand or competitors.
2. Differentiate clearly between observed facts (e.g. actual competitor posts, engagement numbers) and your interpretations/predictions.
3. Align all recommendations with the brand's DNA and strategy.
4. Keep implications, opportunities, and risks realistic.

CRITICAL SCHEMA ENFORCEMENT RULES:
1. The \`type\` field MUST BE EXACTLY ONE OF: "TREND", "INDUSTRY_SIGNAL", "COMPETITOR_MOVEMENT", "AUDIENCE_SIGNAL", "OPPORTUNITY", "RISK", "CONTENT_OPPORTUNITY". Do not use custom strings.
2. The \`confidence\` field MUST BE EXACTLY ONE OF: "HIGH", "MEDIUM", "LOW" (all uppercase).`;

    const userPrompt = `BRAND CONTEXT & SIGNALS:
${compiledContext.contextString}

EXTERNAL MARKET SIGNALS:
- Trends: ${JSON.stringify(externalData.trends)}
- Competitor Signals: ${JSON.stringify(externalData.competitorSignals)}
- Industry Signals: ${JSON.stringify(externalData.industrySignals)}
- Audience Signals: ${JSON.stringify(externalData.audienceSignals)}

Please output a set of high-quality structured market insights based on the above signals.`;

    const result = await ai.generateStructured(
      null,
      systemPrompt,
      userPrompt,
      MarketAnalysisOutputSchema,
      'MarketAnalysisOutput',
      'Structured market intelligence insights',
      job.id!
    );

    const { data, usage } = result;

    // 6. Save AI Usage
    await prisma.aIUsage.create({
      data: {
        organizationId,
        brandId,
        requestId: job.id!,
        provider: 'openai',
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        latencyMs: usage.latencyMs,
        estimatedCost: usage.estimatedCost,
        status: 'SUCCESS'
      }
    });

    // 7. Persist insights and update run status in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear old insights for this brand and org (safe overwrite)
      await tx.marketInsight.deleteMany({
        where: { brandId, organizationId }
      });

      // Insert new insights
      for (const insight of data.insights) {
        await tx.marketInsight.create({
          data: {
            organizationId,
            brandId,
            type: insight.type,
            title: insight.title,
            summary: insight.summary,
            description: insight.description || null,
            source: insight.source,
            sourceUrl: insight.sourceUrl || null,
            relevanceScore: insight.relevanceScore,
            confidence: insight.confidence,
            implications: insight.implications as any,
            opportunities: insight.opportunities as any,
            risks: insight.risks as any,
            contentOpportunities: (insight.contentOpportunities || null) as any,
            relatedCompetitorIds: compiledContext.competitorIds as any
          }
        });
      }

      // Update run status
      await tx.marketIntelligenceRun.update({
        where: { id: runId },
        data: { status: 'COMPLETED' }
      });
    });

    // 8. Create Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: userId || null,
        action: 'MARKET_INTELLIGENCE_REFRESH_COMPLETED',
        entityType: 'MarketIntelligenceRun',
        entityId: runId,
        metadata: { insightCount: data.insights.length }
      }
    });

    console.log(`[Market Intelligence] Job ${job.id} completed successfully. Saved ${data.insights.length} insights.`);

  } catch (error: any) {
    console.error(`[Market Intelligence] Job ${job.id} failed:`, error.message);

    await prisma.marketIntelligenceRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        error: error.message
      }
    });

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: userId || null,
        action: 'MARKET_INTELLIGENCE_REFRESH_FAILED',
        entityType: 'MarketIntelligenceRun',
        entityId: runId,
        metadata: { error: error.message }
      }
    });

    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 2
});

marketIntelligenceWorker.on('failed', (job, err) => {
  console.error(`[Market Intelligence Worker] Job ${job?.id} permanently failed: ${err.message}`);
});
