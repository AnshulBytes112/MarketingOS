import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { ModelGateway } from '../ai/gateway';
import { SEOAnalysisOutputSchema } from './seo-analysis.schema';

const prisma = new PrismaClient();
const ai = new ModelGateway();

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const seoAnalysisWorker = new Worker('seo-analysis', async (job: Job) => {
  const { organizationId, brandId, contentVersionId, userId } = job.data;
  console.log(`[SEO Analysis] Processing job ${job.id} for version ${contentVersionId}`);

  // 1. Idempotency Check & Creation
  // Try to find if an analysis already exists for this version
  let analysis = await prisma.sEOAnalysis.findFirst({
    where: { contentVersionId, organizationId, brandId },
    orderBy: { createdAt: 'desc' }
  });

  if (analysis && analysis.status === 'ANALYZING') {
    console.log(`[SEO Analysis] Job ${job.id}: Already analyzing, skipping duplicate.`);
    return;
  }

  // If completed, we shouldn't run again unless requested explicitly (in which case a new one is made or the old is failed?)
  // The requirements say "create an SEO analysis model", we can just create a new one each time to keep history, or update.
  // The schema has `@@index([contentVersionId])`, but not a unique constraint. So we can create a new record.
  
  analysis = await prisma.sEOAnalysis.create({
    data: {
      organizationId,
      brandId,
      contentItemId: job.data.contentItemId || '', // We will patch this below
      contentVersionId,
      status: 'ANALYZING'
    }
  });

  try {
    // 2. Load context
    const version = await prisma.contentGeneration.findUnique({
      where: { id: contentVersionId },
      include: {
        contentItem: {
          include: {
            brand: { include: { dnaVersions: { where: { publicationStatus: 'ACTIVE' } } } },
            strategy: true,
            channel: true,
          }
        }
      }
    });

    if (!version || version.organizationId !== organizationId) {
      throw new Error(`ContentGeneration ${contentVersionId} not found or tenant mismatch.`);
    }

    // Patch contentItemId
    await prisma.sEOAnalysis.update({
      where: { id: analysis.id },
      data: { contentItemId: version.contentItemId }
    });

    const contentItem = version.contentItem;
    const brand = contentItem.brand;
    const dna = brand.dnaVersions?.[0];
    const strategy = contentItem.strategy;

    // We analyze the text content.
    const textContent = typeof version.textContent === 'string' 
      ? version.textContent 
      : JSON.stringify(version.textContent);

    if (!textContent || textContent === 'null' || textContent === '{}') {
      throw new Error(`No text content to analyze for version ${contentVersionId}`);
    }

    // 3. AI Semantic Checks
    const systemPrompt = `You are a world-class SEO expert and analyst.
Your task is to analyze the provided social media / marketing content and provide structured SEO insights.

CONTEXT:
Brand Industry: ${brand.industry || 'Unknown'}
Brand Target Audience: ${brand.targetAudience || 'Unknown'}
Platform: ${contentItem.platform}
Format: ${contentItem.format}
Goal/Objective: ${contentItem.campaign || strategy?.goal ? JSON.stringify(strategy?.goal) : 'Unknown'}
`;

    const userPrompt = `Please analyze the following content for SEO.
Note: For social media platforms, SEO means keyword relevance, hashtag optimization, search intent, and platform-specific discoverability.

CONTENT TITLE/HOOK: ${contentItem.title}
CONTENT TEXT:
${textContent}

INSTRUCTIONS:
1. Identify the primary Search Intent.
2. Identify core Keyword Themes and any Missing Entities that should be mentioned.
3. Check for Keyword Stuffing (list stuffed keywords if any).
4. Evaluate a composite SEO Score (0-100) and Sub-scores.
5. Provide specific, actionable Recommendations (category, severity, explanation, suggestedAction).
6. Provide any Flags (warnings).
Be highly analytical and realistic. Do NOT fabricate search volume or rankings.`;

    const result = await ai.generateStructured(
      null,
      systemPrompt,
      userPrompt,
      SEOAnalysisOutputSchema,
      'SEOAnalysisOutput',
      'SEO analysis metrics and recommendations',
      job.id!
    );

    const { data, usage } = result;

    // 4. Save Usage
    await prisma.aIUsage.create({
      data: {
        organizationId,
        brandId,
        requestId: job.id!,
        provider: 'openai', // Defaulting based on ModelGateway
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        latencyMs: usage.latencyMs,
        estimatedCost: usage.estimatedCost,
        status: 'SUCCESS'
      }
    });

    // 5. Deterministic scoring augmentations (if any)
    // We trust the AI for semantic sub-scores, but we could cap or adjust them here.
    const finalScore = data.seoScore;

    // 6. Persist SEOAnalysis
    await prisma.sEOAnalysis.update({
      where: { id: analysis.id },
      data: {
        keywordData: data.keywordData as any,
        searchIntent: data.searchIntent,
        seoScore: finalScore,
        subScores: data.subScores as any,
        recommendations: data.recommendations as any,
        flags: data.flags as any,
        metadata: {
          analyzedTextLength: textContent.length,
          model: process.env.AI_MODEL || 'gpt-4o-mini'
        },
        status: 'COMPLETED'
      }
    });

    // 7. Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: userId || null,
        action: 'SEO_ANALYSIS_COMPLETED',
        entityType: 'SEOAnalysis',
        entityId: analysis.id,
        metadata: { contentVersionId, score: finalScore }
      }
    });

    console.log(`[SEO Analysis] Job ${job.id} completed. Score: ${finalScore}`);
  } catch (error: any) {
    console.error(`[SEO Analysis] Job ${job.id} failed:`, error.message);
    
    await prisma.sEOAnalysis.update({
      where: { id: analysis.id },
      data: { status: 'FAILED' }
    });

    await prisma.auditLog.create({
      data: {
        organizationId,
        userId: userId || null,
        action: 'SEO_ANALYSIS_FAILED',
        entityType: 'SEOAnalysis',
        entityId: analysis.id,
        metadata: { contentVersionId, error: error.message }
      }
    });

    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5
});

seoAnalysisWorker.on('failed', (job, err) => {
  console.error(`[SEO Analysis Worker] Job ${job?.id} permanently failed: ${err.message}`);
});
