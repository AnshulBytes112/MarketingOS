'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { determineRequiredModalities } from '../../../lib/generation-matrix';
import { enqueueTextGeneration, enqueueImageGeneration, enqueueVideoGeneration } from '../../../lib/queue';

export async function getContentItems({
  brandId,
  startDate,
  endDate,
  filters,
}: {
  brandId: string;
  startDate: string;
  endDate: string;
  filters?: { platform?: string; funnelStage?: string };
}) {
  const session = await requireAuth();

  // Enforce tenant isolation
  const items = await prisma.contentItem.findMany({
    where: {
      organizationId: session.organizationId,
      brandId: brandId,
      scheduledDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      ...(filters?.platform && filters.platform !== 'ALL'
        ? { platform: { equals: filters.platform, mode: 'insensitive' } }
        : {}),
      ...(filters?.funnelStage && filters.funnelStage !== 'ALL'
        ? { funnelStage: { equals: filters.funnelStage, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { scheduledDate: 'asc' },
    include: {
      generations: {
        orderBy: { version: 'desc' },
        take: 5
      }
    }
  });

  return items;
}

export async function rescheduleContentItem({
  contentItemId,
  newScheduledDate,
  brandId,
  version,
}: {
  contentItemId: string;
  newScheduledDate: string;
  brandId: string;
  version: number;
}) {
  const session = await requireAuth();

  // Reuse existing RBAC logic (generate_content permission covers content creation/scheduling)
  await requirePermission('generate_content');

  // Verify ownership and version (OCC)
  const item = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!item) throw new Error('Content item not found');
  if (item.organizationId !== session.organizationId) throw new Error('Tenant isolation violation');
  if (item.brandId !== brandId) throw new Error('Brand mismatch');
  if (item.version !== version) throw new Error('Conflict: Item was modified by another user');

  const oldDate = item.scheduledDate;

  // Perform update and audit log in a transaction
  const updatedItem = await prisma.$transaction(async (tx) => {
    const updated = await tx.contentItem.update({
      where: { id: contentItemId },
      data: {
        scheduledDate: new Date(newScheduledDate),
        version: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'CONTENT_ITEM_RESCHEDULED',
        entityType: 'ContentItem',
        entityId: contentItemId,
        metadata: {
          previousDate: oldDate.toISOString(),
          newDate: new Date(newScheduledDate).toISOString(),
          brandId,
        },
      },
    });

    return updated;
  });

  return { success: true, item: updatedItem };
}

export async function createContentItem(data: {
  brandId: string;
  contentPlanId: string;
  strategyId: string;
  title: string;
  platform: string;
  format: string;
  scheduledDate: string;
  funnelStage: string;
  contentPillar: string;
  hook?: string;
  cta?: string;
  campaign?: string;
  status?: any; // ContentItemStatus
}) {
  const session = await requireAuth();
  await requirePermission('generate_content');

  const newItem = await prisma.$transaction(async (tx) => {
    const id = crypto.randomUUID();

    const item = await tx.contentItem.create({
      data: {
        id,
        organizationId: session.organizationId,
        brandId: data.brandId,
        contentPlanId: data.contentPlanId,
        strategyId: data.strategyId,
        title: data.title,
        platform: data.platform,
        format: data.format,
        scheduledDate: new Date(data.scheduledDate),
        funnelStage: data.funnelStage,
        contentPillar: data.contentPillar,
        hook: data.hook,
        cta: data.cta,
        campaign: data.campaign,
        status: data.status || 'DRAFT',
        source: 'MANUAL',
        version: 1,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'CONTENT_ITEM_CREATED',
        entityType: 'ContentItem',
        entityId: id,
        metadata: {
          title: item.title,
          source: 'MANUAL',
          brandId: data.brandId,
        },
      },
    });

    return item;
  });

  return { success: true, item: newItem };
}

export async function bulkUpdateContentItems({
  itemIds,
  brandId,
  changes,
}: {
  itemIds: string[];
  brandId: string;
  changes: {
    scheduledDate?: string;
    status?: any; // ContentItemStatus
  };
}) {
  const session = await requireAuth();
  await requirePermission('generate_content');

  await prisma.$transaction(async (tx) => {
    // Verify all items belong to this tenant and brand
    const items = await tx.contentItem.findMany({
      where: { id: { in: itemIds } },
    });

    if (items.length !== itemIds.length) {
      throw new Error('Some items were not found');
    }

    for (const item of items) {
      if (item.organizationId !== session.organizationId) throw new Error('Tenant isolation violation');
      if (item.brandId !== brandId) throw new Error('Brand mismatch');
    }

    const dataToUpdate: any = {
      version: { increment: 1 },
    };
    if (changes.scheduledDate) dataToUpdate.scheduledDate = new Date(changes.scheduledDate);
    if (changes.status) dataToUpdate.status = changes.status;

    await tx.contentItem.updateMany({
      where: { id: { in: itemIds } },
      data: dataToUpdate,
    });

    // Bulk audit log
    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'CONTENT_ITEM_BULK_UPDATED',
        entityType: 'ContentItem',
        entityId: 'BULK', // or could be empty, since entityType is string
        metadata: {
          itemIds,
          changes,
          brandId,
        },
      },
    });
  });

  return { success: true };
}

export async function requestContentGeneration(contentItemId: string) {
  const session = await requireAuth();
  await requirePermission('generate_content');

  // Load item
  const item = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      strategy: true,
    }
  });

  if (!item) throw new Error('Content item not found');
  if (item.organizationId !== session.organizationId) throw new Error('Tenant isolation violation');

  if (item.strategy.publicationStatus !== 'ACTIVE' && item.strategy.status !== 'COMPLETED') {
    throw new Error('STRATEGY_NOT_AVAILABLE');
  }

  // Check if there is an active generation
  const activeGen = await prisma.contentGeneration.findFirst({
    where: {
      contentItemId,
      OR: [
        { textStatus: 'QUEUED' },
        { textStatus: 'GENERATING' },
        { imageStatus: 'QUEUED' },
        { imageStatus: 'GENERATING' },
        { videoStatus: 'QUEUED' },
        { videoStatus: 'GENERATING' }
      ]
    }
  });

  if (activeGen) {
    throw new Error('A generation is already in progress for this item.');
  }

  // Determine required modalities
  const reqs = determineRequiredModalities(item.format, item.platform);

  // Create new generation record
  const latestGen = await prisma.contentGeneration.findFirst({
    where: { contentItemId },
    orderBy: { version: 'desc' }
  });
  const newVersion = (latestGen?.version || 0) + 1;

  const generation = await prisma.contentGeneration.create({
    data: {
      organizationId: session.organizationId,
      brandId: item.brandId,
      contentItemId,
      version: newVersion,
      textStatus: reqs.text ? 'QUEUED' : 'NOT_CONFIGURED',
      imageStatus: reqs.image ? 'QUEUED' : 'NOT_CONFIGURED',
      videoStatus: reqs.video ? 'QUEUED' : 'NOT_CONFIGURED',
    }
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_GENERATION_REQUESTED',
      entityType: 'ContentItem',
      entityId: contentItemId,
      metadata: { generationId: generation.id, version: newVersion, reqs }
    }
  });

  // Enqueue jobs

  if (reqs.text) {
    await enqueueTextGeneration({
      generationId: generation.id,
      organizationId: session.organizationId,
      brandId: item.brandId,
      contentItemId,
    });
  }

  if (reqs.image) {
    await enqueueImageGeneration({
      generationId: generation.id,
      organizationId: session.organizationId,
      brandId: item.brandId,
      contentItemId,
    });
  }

  if (reqs.video) {
    await enqueueVideoGeneration({
      generationId: generation.id,
      organizationId: session.organizationId,
      brandId: item.brandId,
      contentItemId,
    });
  }

  return { success: true, generationId: generation.id };
}

export async function retryContentGeneration(generationId: string, modality: 'TEXT' | 'IMAGE' | 'VIDEO') {
  const session = await requireAuth();
  await requirePermission('generate_content');

  const generation = await prisma.contentGeneration.findUnique({
    where: { id: generationId },
    include: { contentItem: true }
  });

  if (!generation) throw new Error('Generation not found');
  if (generation.organizationId !== session.organizationId) throw new Error('Tenant violation');

  // Audit log
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_GENERATION_RETRIED',
      entityType: 'ContentGeneration',
      entityId: generationId,
      metadata: { modality }
    }
  });

  // Enqueue appropriate job

  if (modality === 'TEXT' && generation.textStatus === 'FAILED') {
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { textStatus: 'QUEUED' }
    });
    await enqueueTextGeneration({
      generationId,
      organizationId: session.organizationId,
      brandId: generation.brandId,
      contentItemId: generation.contentItemId,
    });
  } else if (modality === 'IMAGE' && generation.imageStatus === 'FAILED') {
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { imageStatus: 'QUEUED' }
    });
    await enqueueImageGeneration({
      generationId,
      organizationId: session.organizationId,
      brandId: generation.brandId,
      contentItemId: generation.contentItemId,
    });
  } else if (modality === 'VIDEO' && generation.videoStatus === 'FAILED') {
    await prisma.contentGeneration.update({
      where: { id: generationId },
      data: { videoStatus: 'QUEUED' }
    });
    await enqueueVideoGeneration({
      generationId,
      organizationId: session.organizationId,
      brandId: generation.brandId,
      contentItemId: generation.contentItemId,
    });
  } else {
    throw new Error(`Modality ${modality} is not in a FAILED state`);
  }

  return { success: true };
}
