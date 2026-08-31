import { Worker, Queue } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { TextGenerationSchema } from './text-generation.schema';
import { randomUUID } from 'crypto';
import { DirectDatabaseContextProvider } from './ai/content-context.provider';

const gateway = new ModelGateway();
const contextProvider = new DirectDatabaseContextProvider();

export const textGenerationWorker = new Worker(
  'text-generation',
  async (job) => {
    const { generationId, organizationId, brandId, contentItemId } = job.data;
    const requestId = randomUUID();
    console.log(`[${requestId}] Processing Text Generation for item: ${contentItemId}`);

    // Validate ownership & item
    const generation = await prisma.contentGeneration.findUnique({
      where: { id: generationId },
      include: {
        contentItem: true
      }
    });

    if (!generation || generation.organizationId !== organizationId) {
      throw new Error('Generation record not found or unauthorized');
    }

    const item = generation.contentItem;

    // Set status to GENERATING
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { textStatus: 'GENERATING' }
    });

    try {
      // Get context via abstraction
      const ctx = await contextProvider.getContext(contentItemId, brandId, organizationId);

      const needsCreativeBrief = ['IMAGE', 'VIDEO', 'CAROUSEL', 'REEL'].includes(item.format.toUpperCase());

      // Fetch parent content if this is a regeneration
      let previousContentStr = '';
      if (generation.parentVersionId) {
        const parentVersion = await prisma.contentGeneration.findUnique({
          where: { id: generation.parentVersionId }
        });
        if (parentVersion && parentVersion.textContent) {
          previousContentStr = `\n\nPREVIOUS VERSION CONTEXT:\nYou are rewriting or improving upon this previous version:\n${JSON.stringify(parentVersion.textContent, null, 2)}`;
        }
      }

      const instructionStr = generation.generationInstruction 
        ? `\n\nUSER INSTRUCTION (Must Follow):\n${generation.generationInstruction}\nNOTE: The instruction must NOT override Brand DNA, Strategy, platform constraints, or factual safety.`
        : '';

      const systemPrompt = `You are an expert Social Media Content Creator.
Your task is to write high-converting, destination-specific text content based on the brand's approved strategy.

${ctx.context}${previousContentStr}${instructionStr}

REQUIREMENTS:
- Use simple, natural language for the end-user (e.g., use "reach new people" instead of TOFU, "encourage action" instead of BOFU, do NOT use ICP).
- Tailor the structure to the specific platform (e.g., short engaging captions for Instagram, professional body text for LinkedIn, SEO headers for blogs).
- If it's a Video/Reel format, provide a script.
- If it's a standard post, provide a caption/body.
- Include a specific Call to Action (CTA) aligned with the funnel stage.
- Only use facts present in the provided sources. Do not invent product features.
- ${needsCreativeBrief ? 'Since this format requires visual production, you MUST provide a structured creativeBrief.' : 'Do NOT provide a creativeBrief for this format.'}`;

      const userPrompt = `Please generate the content for this item:
Title/Topic: ${item.title}
Hook Strategy: ${item.hook || 'N/A'}
CTA Strategy: ${item.cta || 'N/A'}
Campaign: ${item.campaign || 'N/A'}`;

      const aiResponse = await gateway.generateStructured(
        null, // Use default model
        systemPrompt,
        userPrompt,
        TextGenerationSchema,
        'TextGenerationSchema',
        'Schema for destination-aware text content',
        requestId
      );

      // Save usage metrics
      await prisma.aIUsage.create({
        data: {
          organizationId,
          brandId,
          requestId,
          provider: process.env.AI_PROVIDER || 'gemini',
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          inputTokens: aiResponse.usage.inputTokens,
          outputTokens: aiResponse.usage.outputTokens,
          totalTokens: aiResponse.usage.totalTokens,
          latencyMs: aiResponse.usage.latencyMs,
          estimatedCost: aiResponse.usage.estimatedCost || 0,
          status: 'COMPLETED',
        },
      });

      // Update generation with success and traceability
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          textStatus: 'COMPLETED',
          textContent: aiResponse.data.content,
          textRequestId: requestId,
          brandDnaVersionId: ctx.brandDnaVersionId,
          strategyVersion: ctx.strategyVersion,
          sourceIds: ctx.sourceIds,
        }
      });

      // Enqueue Quality Scoring
      const qualityQueue = new Queue('quality-scoring', {
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        }
      });
      await qualityQueue.add(`quality-score-${generationId}`, {
        generationId,
        organizationId,
        brandId,
        contentVersionId: generationId
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        jobId: `quality-score-${generationId}`
      });
      await qualityQueue.close();

      console.log(`[${requestId}] Text Generation complete for generation: ${generationId}`);
    } catch (error: any) {
      console.error(`[${requestId}] Text Generation failed for generation: ${generationId}`, error);
      
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          textStatus: 'FAILED',
          errorLog: { textError: error.message }
        }
      });
      
      throw error;
    }
  }, {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    }
  }
);

textGenerationWorker.on('failed', (job, err) => {
  console.error(`Text Generation Job ${job?.id} failed:`, err.message);
});
