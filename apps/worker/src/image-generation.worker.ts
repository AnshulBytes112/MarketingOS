import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // For MinIO/Localstack support if applicable
});

export const imageGenerationWorker = new Worker(
  'image-generation',
  async (job) => {
    const { generationId, organizationId, brandId, contentItemId } = job.data;
    const requestId = randomUUID();
    console.log(`[${requestId}] Processing Image Generation for item: ${contentItemId}`);

    const generation = await prisma.contentGeneration.findUnique({
      where: { id: generationId },
      include: {
        contentItem: { include: { strategy: true, channel: true } },
      }
    });

    if (!generation || generation.organizationId !== organizationId) {
      throw new Error('Generation record not found or unauthorized');
    }

    const item = generation.contentItem;

    if (item.strategy.publicationStatus !== 'ACTIVE' && item.strategy.status !== 'COMPLETED') {
      throw new Error('STRATEGY_NOT_AVAILABLE');
    }

    // Check configuration
    const imageProvider = process.env.IMAGE_PROVIDER;
    if (!imageProvider || imageProvider === 'none') {
      console.warn(`[${requestId}] Image generation provider not configured.`);
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: { imageStatus: 'NOT_CONFIGURED' }
      });
      return;
    }

    // Set status to GENERATING
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { imageStatus: 'GENERATING' }
    });

    try {
      // Simulate/mock actual Gemini/Imagen API call for now.
      // In production, use standard @google/genai or Vertex AI Imagen here.
      // We will pretend we received a Buffer containing the image bytes.
      
      const startTimeMs = performance.now();
      
      // MOCK: Generate a basic dummy image buffer to prove S3 persistence works independently
      const mockImageBuffer = Buffer.from(
        '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="red"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24">Mock Image</text></svg>',
        'utf8'
      );
      
      const latencyMs = Math.round(performance.now() - startTimeMs);

      // Save to S3
      const objectKey = `organizations/${organizationId}/brands/${brandId}/generations/${generationId}/image_${requestId}.svg`;
      const mimeType = 'image/svg+xml';

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || '',
        Key: objectKey,
        Body: mockImageBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      // Create GeneratedAsset
      await prisma.generatedAsset.create({
        data: {
          organizationId,
          brandId,
          generationId,
          contentItemId,
          type: 'IMAGE',
          objectKey,
          mimeType,
          provider: imageProvider || 'mock',
          model: process.env.IMAGE_MODEL || 'mock-model',
          slideIndex: 0,
        }
      });

      // Update generation with success
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          imageStatus: 'COMPLETED',
          imageRequestId: requestId,
        }
      });

      console.log(`[${requestId}] Image Generation complete for generation: ${generationId}`);
    } catch (error: any) {
      console.error(`[${requestId}] Image Generation failed for generation: ${generationId}`, error);
      
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          imageStatus: 'FAILED',
          errorLog: { imageError: error.message }
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

imageGenerationWorker.on('failed', (job, err) => {
  console.error(`Image Generation Job ${job?.id} failed:`, err.message);
});
