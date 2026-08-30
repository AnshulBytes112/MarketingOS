import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { analyticsProviderRegistry } from './provider-registry';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const analyticsSyncWorker = new Worker(
  'analytics-sync',
  async (job) => {
    const { organizationId, contentChannelId, dateRange, userId } = job.data;
    console.log(`[Analytics Sync] Started for org ${organizationId}`);

    try {
      // Find channels to sync
      const channelQuery: any = {
        organizationId,
        isActive: true,
      };
      if (contentChannelId) {
        channelQuery.id = contentChannelId;
      }

      const channels = await prisma.contentChannel.findMany({
        where: channelQuery,
      });

      console.log(`[Analytics Sync] Found ${channels.length} channels to sync`);

      for (const channel of channels) {
        try {
          const provider = analyticsProviderRegistry.get(channel.platform);
          
          // Check if provider is configured
          const validation = await provider.validate(channel);
          if (!validation.valid) {
            console.log(`[Analytics Sync] Channel ${channel.id} (${channel.platform}) skipping: ${validation.error}`);
            continue; // Skip channels that are not configured
          }

          // Fetch post metrics for published jobs
          const publishedJobs = await prisma.publishingJob.findMany({
            where: {
              organizationId,
              contentChannelId: channel.id,
              status: 'PUBLISHED',
              externalPostId: { not: null },
              ...(dateRange ? {
                publishedAt: {
                  gte: new Date(dateRange.from),
                  lte: new Date(dateRange.to)
                }
              } : {})
            },
            include: {
              contentItem: true
            }
          });

          console.log(`[Analytics Sync] Channel ${channel.id}: found ${publishedJobs.length} published jobs`);

          // Normalize metricDate to today UTC (start of day)
          const now = new Date();
          const metricDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

          for (const pubJob of publishedJobs) {
            if (!pubJob.externalPostId) continue;

            try {
              const result = await provider.fetchPostMetrics(pubJob.externalPostId, channel);

              if (result.success && result.metrics) {
                // Calculate engagement deterministically
                let engagement = null;
                const m = result.metrics;
                if (m.likes !== undefined || m.comments !== undefined || m.shares !== undefined || m.saves !== undefined) {
                  engagement = 
                    (m.likes || 0) + 
                    (m.comments || 0) + 
                    (m.shares || 0) + 
                    (m.saves || 0);
                }

                let engagementRate = null;
                if (engagement !== null && m.reach) {
                  engagementRate = (engagement / m.reach) * 100;
                }

                // Upsert to handle the unique constraint
                await prisma.contentMetricSnapshot.upsert({
                  where: {
                    organizationId_externalPostId_metricDate_provider: {
                      organizationId,
                      externalPostId: pubJob.externalPostId,
                      metricDate,
                      provider: channel.platform
                    }
                  },
                  create: {
                    organizationId,
                    brandId: channel.brandId,
                    contentItemId: pubJob.contentItemId,
                    contentVersionId: pubJob.contentVersionId,
                    publishingJobId: pubJob.id,
                    contentChannelId: channel.id,
                    campaignId: pubJob.contentItem.campaignId,
                    externalPostId: pubJob.externalPostId,
                    platform: channel.platform,
                    metricDate,
                    reach: m.reach,
                    impressions: m.impressions,
                    likes: m.likes,
                    comments: m.comments,
                    shares: m.shares,
                    saves: m.saves,
                    clicks: m.clicks,
                    videoViews: m.videoViews,
                    watchTime: m.watchTime,
                    followersGained: m.followersGained,
                    followersLost: m.followersLost,
                    engagementRate,
                    rawMetrics: result.rawMetrics || {},
                    provider: channel.platform
                  },
                  update: {
                    // Update only happens if the same day sync is triggered again, meaning we just update the daily snapshot
                    reach: m.reach,
                    impressions: m.impressions,
                    likes: m.likes,
                    comments: m.comments,
                    shares: m.shares,
                    saves: m.saves,
                    clicks: m.clicks,
                    videoViews: m.videoViews,
                    watchTime: m.watchTime,
                    followersGained: m.followersGained,
                    followersLost: m.followersLost,
                    engagementRate,
                    rawMetrics: result.rawMetrics || {}
                  }
                });
              } else {
                console.log(`[Analytics Sync] Failed to fetch metrics for post ${pubJob.externalPostId}: ${result.error}`);
              }
            } catch (jobErr) {
              console.error(`[Analytics Sync] Error processing post ${pubJob.externalPostId}:`, jobErr);
            }
          }

          // Optionally fetch channel-level metrics if the provider supports it
          if (provider.fetchChannelMetrics) {
             const channelResult = await provider.fetchChannelMetrics(channel);
             if (channelResult.success && channelResult.metrics) {
                // Here we could store channel-level metrics in a separate table or update ContentChannel metadata
             }
          }

        } catch (chanErr) {
          console.error(`[Analytics Sync] Error processing channel ${channel.id}:`, chanErr);
        }
      }

      // Log audit action
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: userId || null,
          action: 'ANALYTICS_SYNC_COMPLETED',
          entityType: 'Organization',
          entityId: organizationId,
          metadata: {
             channelsCount: channels.length
          }
        }
      });

      console.log(`[Analytics Sync] Completed for org ${organizationId}`);
    } catch (error: any) {
      console.error(`[Analytics Sync] Failed for org ${organizationId}:`, error);
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId: userId || null,
          action: 'ANALYTICS_SYNC_FAILED',
          entityType: 'Organization',
          entityId: organizationId,
          metadata: {
             error: error.message
          }
        }
      });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);
