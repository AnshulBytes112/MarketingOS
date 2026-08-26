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
  forcePathStyle: true,
});

export const videoGenerationWorker = new Worker(
  'video-generation',
  async (job) => {
    const { generationId, organizationId, brandId, contentItemId } = job.data;
    const requestId = randomUUID();
    console.log(`[${requestId}] Processing Video Generation for item: ${contentItemId}`);

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

    const videoProvider = process.env.VIDEO_PROVIDER;
    if (!videoProvider || videoProvider === 'none') {
      console.warn(`[${requestId}] Video generation provider not configured.`);
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: { videoStatus: 'NOT_CONFIGURED' }
      });
      return;
    }

    // Determine state
    let operationId = generation.videoOperationId;

    if (!operationId) {
      // Start a new video generation operation
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: { videoStatus: 'GENERATING' }
      });

      // MOCK: Submit to Veo / Video provider
      console.log(`[${requestId}] Submitting new video generation request to provider...`);
      operationId = `op_${randomUUID()}`;

      // Persist operation ID to survive worker restarts
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: { videoOperationId: operationId }
      });
      
      console.log(`[${requestId}] Video generation started. Operation ID: ${operationId}. Polling...`);
    } else {
      console.log(`[${requestId}] Resuming video generation poll for Operation ID: ${operationId}.`);
    }

    try {
      // MOCK POLLING: Wait a short time to simulate asynchronous video processing
      // In reality, this would loop and query the provider's operation status endpoint
      let isCompleted = false;
      let attempt = 0;
      
      while (!isCompleted && attempt < 3) {
        attempt++;
        console.log(`[${requestId}] Polling provider for operation ${operationId} (Attempt ${attempt})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Sleep 2 seconds
        
        // MOCK: assume it finishes on attempt 3
        if (attempt >= 3) {
           isCompleted = true;
        }
      }

      if (!isCompleted) {
         throw new Error('Video generation timed out while polling.');
      }

      console.log(`[${requestId}] Provider operation ${operationId} completed. Downloading result...`);

      // MOCK: Generate a dummy video/mp4 buffer
      const mockVideoBuffer = Buffer.from('mock video bytes', 'utf8');

      // Save to S3
      const objectKey = `organizations/${organizationId}/brands/${brandId}/generations/${generationId}/video_${operationId}.mp4`;
      const mimeType = 'video/mp4';

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || '',
        Key: objectKey,
        Body: mockVideoBuffer,
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
          type: 'VIDEO',
          objectKey,
          mimeType,
          provider: videoProvider || 'mock',
          model: process.env.VIDEO_MODEL || 'mock-veo',
          slideIndex: 0,
        }
      });

      // Update generation with success
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          videoStatus: 'COMPLETED',
          videoRequestId: requestId,
        }
      });

      console.log(`[${requestId}] Video Generation complete for generation: ${generationId}`);
    } catch (error: any) {
      console.error(`[${requestId}] Video Generation failed for generation: ${generationId}`, error);
      
      await prisma.contentGeneration.update({
        where: { id: generationId },
        data: {
          videoStatus: 'FAILED',
          errorLog: { videoError: error.message }
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

videoGenerationWorker.on('failed', (job, err) => {
  console.error(`Video Generation Job ${job?.id} failed:`, err.message);
});
