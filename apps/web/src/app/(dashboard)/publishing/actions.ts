'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueuePublishingJob } from '@/lib/queue';

/**
 * Validates ownership and Approval gate for a ContentVersion
 */
async function validatePublishingGate(
  session: any,
  contentItemId: string,
  contentVersionId: string,
  contentChannelId: string
) {
  // 1. Ownership checks
  const channel = await prisma.contentChannel.findFirst({
    where: { id: contentChannelId, organizationId: session.organizationId }
  });
  if (!channel) throw new Error('Invalid Content Channel');

  const item = await prisma.contentItem.findFirst({
    where: { id: contentItemId, organizationId: session.organizationId, brandId: channel.brandId }
  });
  if (!item) throw new Error('Invalid Content Item');

  const version = await prisma.contentGeneration.findFirst({
    where: { id: contentVersionId, contentItemId }
  });
  if (!version) throw new Error('Invalid Content Version');

  // 2. Approval Gate
  // The exact version must have an APPROVED approval record
  const approval = await prisma.approval.findFirst({
    where: {
      organizationId: session.organizationId,
      contentVersionId,
      status: 'APPROVED'
    }
  });

  if (!approval) {
    throw new Error('This specific content version has not been approved for publishing.');
  }

  return { item, version, channel };
}

export async function scheduleContent(
  contentItemId: string,
  contentVersionId: string,
  contentChannelId: string,
  scheduledAt: Date
) {
  const session = await requireAuth();
  await requirePermission('publishing.schedule');

  if (scheduledAt.getTime() <= Date.now()) {
    throw new Error('Scheduled time must be in the future.');
  }

  const { item, version, channel } = await validatePublishingGate(session, contentItemId, contentVersionId, contentChannelId);

  // Prevent conflicting active jobs for the same exact version/channel
  const existingActive = await prisma.publishingJob.findFirst({
    where: {
      contentVersionId,
      contentChannelId,
      status: { in: ['QUEUED', 'SCHEDULED', 'PUBLISHING'] }
    }
  });

  if (existingActive) {
    throw new Error('An active publishing job already exists for this version and channel.');
  }

  const job = await prisma.publishingJob.create({
    data: {
      organizationId: session.organizationId,
      brandId: channel.brandId,
      contentItemId: item.id,
      contentVersionId: version.id,
      contentChannelId: channel.id,
      status: 'SCHEDULED',
      scheduledAt: scheduledAt,
      provider: channel.platform,
      createdById: session.userId,
    }
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_SCHEDULED',
      entityType: 'PublishingJob',
      entityId: job.id,
      metadata: { contentItemId, contentVersionId, contentChannelId, scheduledAt }
    }
  });

  // Calculate delay in milliseconds
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  
  // Create delayed BullMQ job
  await enqueuePublishingJob({ publishingJobId: job.id }, delay);

  return job.id;
}

export async function publishContent(
  contentItemId: string,
  contentVersionId: string,
  contentChannelId: string
) {
  const session = await requireAuth();
  await requirePermission('publishing.publish');

  const { item, version, channel } = await validatePublishingGate(session, contentItemId, contentVersionId, contentChannelId);

  const existingActive = await prisma.publishingJob.findFirst({
    where: {
      contentVersionId,
      contentChannelId,
      status: { in: ['QUEUED', 'SCHEDULED', 'PUBLISHING'] }
    }
  });

  if (existingActive) {
    throw new Error('An active publishing job already exists for this version and channel.');
  }

  const job = await prisma.publishingJob.create({
    data: {
      organizationId: session.organizationId,
      brandId: channel.brandId,
      contentItemId: item.id,
      contentVersionId: version.id,
      contentChannelId: channel.id,
      status: 'QUEUED',
      provider: channel.platform,
      createdById: session.userId,
    }
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_PUBLISH_REQUESTED',
      entityType: 'PublishingJob',
      entityId: job.id,
      metadata: { contentItemId, contentVersionId, contentChannelId }
    }
  });

  await enqueuePublishingJob({ publishingJobId: job.id });

  return job.id;
}

export async function cancelScheduledPublish(jobId: string) {
  const session = await requireAuth();
  await requirePermission('publishing.cancel');

  const job = await prisma.publishingJob.findFirst({
    where: { id: jobId, organizationId: session.organizationId }
  });

  if (!job) throw new Error('Job not found');

  if (job.status !== 'SCHEDULED' && job.status !== 'QUEUED') {
    throw new Error('Only queued or scheduled jobs can be cancelled.');
  }

  await prisma.publishingJob.update({
    where: { id: job.id },
    data: { status: 'CANCELLED' }
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_PUBLISH_CANCELLED',
      entityType: 'PublishingJob',
      entityId: job.id,
    }
  });

  return true;
}

export async function retryPublishingJob(jobId: string) {
  const session = await requireAuth();
  await requirePermission('publishing.retry');

  const job = await prisma.publishingJob.findFirst({
    where: { id: jobId, organizationId: session.organizationId }
  });

  if (!job) throw new Error('Job not found');

  if (job.status !== 'FAILED') {
    throw new Error('Only failed jobs can be retried.');
  }

  await prisma.publishingJob.update({
    where: { id: job.id },
    data: { status: 'QUEUED' } // We reset to QUEUED to enqueue it again.
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_PUBLISH_RETRIED',
      entityType: 'PublishingJob',
      entityId: job.id,
    }
  });

  await enqueuePublishingJob({ publishingJobId: job.id });

  return true;
}

export async function getPublishingJobs() {
  const session = await requireAuth();

  const jobs = await prisma.publishingJob.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contentItem: true,
      contentVersion: true,
      contentChannel: true,
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return jobs;
}
