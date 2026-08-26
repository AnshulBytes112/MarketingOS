import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { TextGenerationSchema } from './text-generation.schema';
import { randomUUID } from 'crypto';

const gateway = new ModelGateway();

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
        contentItem: {
          include: {
            strategy: true,
            channel: true,
          }
        },
      }
    });

    if (!generation || generation.organizationId !== organizationId) {
      throw new Error('Generation record not found or unauthorized');
    }

    const item = generation.contentItem;

    if (item.strategy.publicationStatus !== 'ACTIVE' && item.strategy.status !== 'COMPLETED') {
      throw new Error('STRATEGY_NOT_AVAILABLE');
    }

    // Set status to GENERATING
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { textStatus: 'GENERATING' }
    });

    try {
      // Load Brand DNA
      const activeDna = await prisma.brandDNAVersion.findFirst({
        where: {
          brandId,
          organizationId,
          publicationStatus: 'ACTIVE',
          status: 'COMPLETED',
        },
      });

      const systemPrompt = `You are an expert Social Media Content Creator.
Your task is to write high-converting, destination-specific text content based on the brand's approved strategy.

BRAND CONTEXT:
Name: ${item.brandId}
DNA: ${JSON.stringify(activeDna || {})}

STRATEGIC CONTEXT:
Strategy Outline: ${JSON.stringify(item.strategy || {})}
Content Pillar: ${item.contentPillar}
Funnel Stage: ${item.funnelStage}

DESTINATION CONTEXT:
Platform: ${item.platform}
Format: ${item.format}
Channel Details: ${JSON.stringify(item.channel || {})}

REQUIREMENTS:
- Use simple, natural language for the end-user (do not use internal marketing jargon like TOFU/MOFU in the final text).
- Tailor the structure to the specific platform (e.g., short engaging captions for Instagram, professional body text for LinkedIn, SEO headers for blogs).
- If it's a Video/Reel format, provide a script.
- If it's a standard post, provide a caption/body.
- Include a specific Call to Action (CTA) aligned with the funnel stage.`;

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

      // Update generation with success
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          textStatus: 'COMPLETED',
          textContent: aiResponse.data.content,
          textRequestId: requestId,
        }
      });

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
