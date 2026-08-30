'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueueAnalyticsSync } from '@/lib/queue';

export async function syncAnalytics(channelId?: string, dateRange?: { from: string; to: string }) {
  const session = await requireAuth();
  
  if (!session.organizationId) {
    throw new Error('No active organization');
  }

  await requirePermission('analytics.sync');

  // Verify channel ownership if provided
  if (channelId) {
    const channel = await prisma.contentChannel.findFirst({
      where: {
        id: channelId,
        organizationId: session.organizationId,
      }
    });

    if (!channel) {
      throw new Error('Channel not found or unauthorized');
    }
  }

  let parsedDateRange;
  if (dateRange) {
    parsedDateRange = {
      from: new Date(dateRange.from),
      to: new Date(dateRange.to),
    };
  }

  // Enqueue job
  await enqueueAnalyticsSync({
    organizationId: session.organizationId,
    contentChannelId: channelId,
    dateRange: parsedDateRange,
    userId: session.userId,
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'ANALYTICS_SYNC_REQUESTED',
      entityType: channelId ? 'ContentChannel' : 'Organization',
      entityId: channelId || session.organizationId,
    }
  });

  return { success: true };
}

// Data Fetching Helpers for Server Components
export async function getAnalyticsOverview(organizationId: string, dateRange?: { from: Date; to: Date }) {
  await requirePermission('analytics.view');

  const dateFilter = dateRange ? {
    metricDate: {
      gte: dateRange.from,
      lte: dateRange.to
    }
  } : {};

  // For overview, we want the most recent snapshot per post within the date range,
  // or we can just sum up the metrics if we are looking at total reached/engaged.
  // Wait, if we want total reach, and reach is cumulative, summing snapshots per day is wrong.
  // We should find the max metrics per post within the date range, or the latest snapshot.
  
  // Since we only store one snapshot per day per post, the latest snapshot in the date range
  // represents the total performance up to that date.
  
  // Let's use a query to get the latest snapshot per post.
  const snapshots = await prisma.contentMetricSnapshot.findMany({
    where: {
      organizationId,
      ...dateFilter,
    },
    orderBy: {
      metricDate: 'desc'
    },
    distinct: ['externalPostId']
  });

  let totalReach = 0;
  let totalImpressions = 0;
  let totalEngagement = 0;
  let totalClicks = 0;
  let totalViews = 0;
  let postsWithReach = 0;
  let hasData = false;

  for (const s of snapshots) {
    if (s.reach !== null) { totalReach += s.reach; hasData = true; postsWithReach++; }
    if (s.impressions !== null) { totalImpressions += s.impressions; hasData = true; }
    if (s.clicks !== null) { totalClicks += s.clicks; hasData = true; }
    if (s.videoViews !== null) { totalViews += s.videoViews; hasData = true; }
    
    let engagement = null;
    if (s.likes !== null || s.comments !== null || s.shares !== null || s.saves !== null) {
      engagement = (s.likes || 0) + (s.comments || 0) + (s.shares || 0) + (s.saves || 0);
      totalEngagement += engagement;
      hasData = true;
    }
  }

  const averageEngagementRate = (totalEngagement > 0 && totalReach > 0) ? (totalEngagement / totalReach) * 100 : null;

  return {
    totalPublished: snapshots.length,
    totalReach: hasData && totalReach > 0 ? totalReach : null,
    totalImpressions: hasData && totalImpressions > 0 ? totalImpressions : null,
    totalEngagement: hasData && totalEngagement > 0 ? totalEngagement : null,
    totalClicks: hasData && totalClicks > 0 ? totalClicks : null,
    totalViews: hasData && totalViews > 0 ? totalViews : null,
    averageEngagementRate,
    hasData: snapshots.length > 0,
  };
}

export async function getContentPerformance(organizationId: string, dateRange?: { from: Date; to: Date }) {
  await requirePermission('analytics.view');

  const dateFilter = dateRange ? {
    metricDate: {
      gte: dateRange.from,
      lte: dateRange.to
    }
  } : {};

  const snapshots = await prisma.contentMetricSnapshot.findMany({
    where: {
      organizationId,
      ...dateFilter,
    },
    orderBy: {
      metricDate: 'desc'
    },
    distinct: ['externalPostId'],
    include: {
      contentItem: true,
      contentChannel: true,
      campaign: true,
      contentVersion: true,
    }
  });

  return snapshots.map(s => {
    let engagement = null;
    if (s.likes !== null || s.comments !== null || s.shares !== null || s.saves !== null) {
      engagement = (s.likes || 0) + (s.comments || 0) + (s.shares || 0) + (s.saves || 0);
    }

    return {
      id: s.id,
      contentTitle: s.contentItem.title,
      platform: s.platform,
      channelName: s.contentChannel.name,
      campaignName: s.campaign?.name,
      metricDate: s.metricDate,
      reach: s.reach,
      impressions: s.impressions,
      engagement,
      engagementRate: s.engagementRate,
      clicks: s.clicks,
      views: s.videoViews,
      qualityScore: s.contentVersion.qualityScore ? (s.contentVersion.qualityScore as any).totalScore : null,
    };
  });
}

export async function getCampaignPerformance(organizationId: string, campaignId: string, dateRange?: { from: Date; to: Date }) {
  await requirePermission('analytics.view');

  const dateFilter = dateRange ? {
    metricDate: {
      gte: dateRange.from,
      lte: dateRange.to
    }
  } : {};

  const snapshots = await prisma.contentMetricSnapshot.findMany({
    where: {
      organizationId,
      campaignId,
      ...dateFilter,
    },
    orderBy: {
      metricDate: 'desc'
    },
    distinct: ['externalPostId']
  });

  let totalReach = 0;
  let totalEngagement = 0;
  let totalClicks = 0;
  let totalViews = 0;
  let hasData = false;

  for (const s of snapshots) {
    if (s.reach !== null) { totalReach += s.reach; hasData = true; }
    if (s.clicks !== null) { totalClicks += s.clicks; hasData = true; }
    if (s.videoViews !== null) { totalViews += s.videoViews; hasData = true; }
    
    if (s.likes !== null || s.comments !== null || s.shares !== null || s.saves !== null) {
      totalEngagement += (s.likes || 0) + (s.comments || 0) + (s.shares || 0) + (s.saves || 0);
      hasData = true;
    }
  }

  return {
    publishedContent: snapshots.length,
    reach: hasData && totalReach > 0 ? totalReach : null,
    engagement: hasData && totalEngagement > 0 ? totalEngagement : null,
    engagementRate: (hasData && totalEngagement > 0 && totalReach > 0) ? (totalEngagement / totalReach) * 100 : null,
    clicks: hasData && totalClicks > 0 ? totalClicks : null,
    views: hasData && totalViews > 0 ? totalViews : null,
  };
}
