import { Worker, Job } from 'bullmq';
import { prisma } from '@abge/database';
import { providerRegistry } from './provider-registry';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const publishingWorker = new Worker(
  'publishing',
  async (job: Job) => {
    const { publishingJobId } = job.data;
    
    if (!publishingJobId) {
      throw new Error('publishingJobId is required');
    }

    console.log(`[PublishingWorker] Processing job ${publishingJobId}`);

    // 1. Load the job and lock its status
    const pubJob = await prisma.publishingJob.findUnique({
      where: { id: publishingJobId },
      include: {
        contentItem: true,
        contentVersion: {
          include: {
            assets: true
          }
        },
        contentChannel: true
      }
    });

    if (!pubJob) {
      console.warn(`[PublishingWorker] Job ${publishingJobId} not found, skipping.`);
      return;
    }

    // 2. Idempotency and status check
    if (pubJob.status === 'PUBLISHED' || pubJob.status === 'CANCELLED') {
      console.log(`[PublishingWorker] Job ${publishingJobId} is already ${pubJob.status}, skipping.`);
      return;
    }

    if (pubJob.status !== 'QUEUED' && pubJob.status !== 'SCHEDULED' && pubJob.status !== 'FAILED') {
      console.log(`[PublishingWorker] Job ${publishingJobId} has unprocessable status ${pubJob.status}.`);
      return;
    }

    // 3. Transition to PUBLISHING atomically
    const startedJob = await prisma.publishingJob.updateMany({
      where: {
        id: pubJob.id,
        status: pubJob.status // optimistic concurrency check
      },
      data: {
        status: 'PUBLISHING',
        startedAt: new Date()
      }
    });

    if (startedJob.count === 0) {
      console.warn(`[PublishingWorker] Job ${publishingJobId} state changed before processing. Bailing out.`);
      return;
    }

    try {
      // 4. Validate Provider & Content
      const providerType = pubJob.contentChannel.platform; // e.g. INSTAGRAM, LINKEDIN
      const provider = providerRegistry.get(providerType);

      // Validate required media
      const format = pubJob.contentItem.format;
      if (['IMAGE', 'VIDEO', 'CAROUSEL', 'REEL'].includes(format)) {
        if (!pubJob.contentVersion.assets || pubJob.contentVersion.assets.length === 0) {
          throw new Error('REQUIRED_MEDIA_MISSING');
        }
      }

      const validation = await provider.validate(pubJob.contentItem, pubJob.contentVersion, pubJob.contentChannel, pubJob.contentVersion.assets);
      if (!validation.valid) {
        throw new Error(validation.error || 'PLATFORM_FORMAT_MISMATCH');
      }

      // 5. Call Provider
      const result = await provider.publish(pubJob.contentItem, pubJob.contentVersion, pubJob.contentChannel, pubJob.contentVersion.assets);

      if (result.success) {
        // Success
        await prisma.publishingJob.update({
          where: { id: pubJob.id },
          data: {
            status: 'PUBLISHED',
            externalPostId: result.externalPostId,
            externalUrl: result.externalUrl,
            publishedAt: new Date(),
            completedAt: new Date(),
            attemptCount: { increment: 1 }
          }
        });

        await prisma.auditLog.create({
          data: {
            organizationId: pubJob.organizationId,
            userId: pubJob.createdById,
            action: 'CONTENT_PUBLISHED',
            entityType: 'PublishingJob',
            entityId: pubJob.id,
            metadata: { 
              contentItemId: pubJob.contentItemId, 
              contentVersionId: pubJob.contentVersionId,
              channelId: pubJob.contentChannelId,
              externalUrl: result.externalUrl
            }
          }
        });

        console.log(`[PublishingWorker] Job ${publishingJobId} published successfully.`);
      } else {
        throw new Error(result.error || 'PROVIDER_ERROR');
      }
    } catch (error: any) {
      // 6. Handle Failure
      console.error(`[PublishingWorker] Job ${publishingJobId} failed: ${error.message}`);
      
      const sanitizedError = error.message.replace(/([0-9a-fA-F]{32,})|([A-Za-z0-9_-]{20,})/g, '[REDACTED_SECRET]');

      await prisma.publishingJob.update({
        where: { id: pubJob.id },
        data: {
          status: 'FAILED',
          error: sanitizedError,
          completedAt: new Date(),
          attemptCount: { increment: 1 }
        }
      });

      await prisma.auditLog.create({
        data: {
          organizationId: pubJob.organizationId,
          userId: pubJob.createdById,
          action: 'CONTENT_PUBLISH_FAILED',
          entityType: 'PublishingJob',
          entityId: pubJob.id,
          metadata: { 
            contentItemId: pubJob.contentItemId, 
            contentVersionId: pubJob.contentVersionId,
            channelId: pubJob.contentChannelId,
            error: sanitizedError
          }
        }
      });

      // We re-throw so BullMQ can handle retries if configured, but for our strict requirements, 
      // we usually want explicit manual retry for permanent provider failures rather than automatic loop.
      // If we don't rethrow, BullMQ marks the job 'completed' even though our domain state is FAILED.
      // This is correct as we manage state in the DB.
    }
  },
  {
    connection,
    concurrency: 5,
  }
);
