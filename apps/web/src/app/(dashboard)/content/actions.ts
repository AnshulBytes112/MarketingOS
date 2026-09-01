'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';

export async function getAllContentItems({
  brandId,
  filters,
}: {
  brandId: string;
  filters?: { platform?: string; funnelStage?: string };
}) {
  const session = await requireAuth();
  await requirePermission('content.view' as any);

  const items = await prisma.contentItem.findMany({
    where: {
      organizationId: session.organizationId,
      brandId: brandId,
      ...(filters?.platform && filters.platform !== 'ALL'
        ? { platform: { equals: filters.platform, mode: 'insensitive' } }
        : {}),
      ...(filters?.funnelStage && filters.funnelStage !== 'ALL'
        ? { funnelStage: { equals: filters.funnelStage, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { scheduledDate: 'desc' },
    include: {
      generations: {
        orderBy: { version: 'desc' },
        take: 5,
        include: {
          approvals: true
        }
      },
      channel: true
    }
  });

  return items;
}
