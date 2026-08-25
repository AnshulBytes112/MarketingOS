import { Worker, Job } from 'bullmq';
import { prisma } from '@abge/database';
import { getProvider } from './ingestion/registry';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface IngestionJobData {
  organizationId: string;
  brandId: string;
  competitorId: string;
  force?: boolean;
}

export const competitorIngestionWorker = new Worker<IngestionJobData>(
  'competitor-ingestion',
  async (job: Job<IngestionJobData>) => {
    const { organizationId, brandId, competitorId } = job.data;
    console.log(`[IngestionWorker] Starting ingestion job ${job.id} for competitor ${competitorId}`);

    // 1. Fetch competitor and verify scopes
    const competitor = await prisma.brandCompetitor.findFirst({
      where: {
        id: competitorId,
        brandId,
        organizationId,
      },
    });

    if (!competitor) {
      throw new Error(`Competitor ${competitorId} not found or unauthorized for brand ${brandId}`);
    }

    // 2. Identify all platform configurations
    const platforms: { name: string; handle: string }[] = [];
    
    if (competitor.websiteUrl) {
      platforms.push({ name: 'website', handle: competitor.websiteUrl });
    }
    if (competitor.instagram) {
      platforms.push({ name: 'instagram', handle: competitor.instagram });
    }
    if (competitor.linkedin) {
      platforms.push({ name: 'linkedin', handle: competitor.linkedin });
    }
    if (competitor.twitter) {
      platforms.push({ name: 'twitter', handle: competitor.twitter });
    }
    if (competitor.youtube) {
      platforms.push({ name: 'youtube', handle: competitor.youtube });
    }
    if (competitor.tiktok) {
      platforms.push({ name: 'tiktok', handle: competitor.tiktok });
    }

    if (platforms.length === 0) {
      console.log(`[IngestionWorker] No platforms configured for competitor ${competitorId}`);
      return;
    }

    // 3. Process each platform
    for (const item of platforms) {
      console.log(`[IngestionWorker] Syncing platform ${item.name} for competitor ${competitorId}`);

      // Upsert CompetitorAccount first (set status to SYNCING)
      let account = await prisma.competitorAccount.upsert({
        where: {
          organizationId_competitorId_platform: {
            organizationId,
            competitorId,
            platform: item.name,
          },
        },
        create: {
          organizationId,
          brandId,
          competitorId,
          platform: item.name,
          handle: item.handle,
          syncStatus: 'SYNCING',
          sourceType: item.name === 'website' ? 'PUBLIC_WEB' : 'OFFICIAL_API',
        },
        update: {
          handle: item.handle,
          syncStatus: 'SYNCING',
        },
      });

      const provider = getProvider(item.name);
      
      if (!provider) {
        await prisma.competitorAccount.update({
          where: { id: account.id },
          data: { 
            syncStatus: 'FAILED',
            lastSyncedAt: new Date(),
          },
        });
        console.warn(`[IngestionWorker] No provider registered for platform: ${item.name}`);
        continue;
      }

      const state = provider.getState();

      if (state !== 'AVAILABLE') {
        // Log unavailability but do not break other platforms
        await prisma.competitorAccount.update({
          where: { id: account.id },
          data: { 
            syncStatus: state === 'AUTH_REQUIRED' ? 'AUTH_REQUIRED' : 'FAILED',
            lastSyncedAt: new Date(),
          },
        });
        console.log(`[IngestionWorker] Provider ${item.name} is ${state}. Skipping automated sync.`);
        continue;
      }

      try {
        // Fetch account data
        const accInfo = await provider.fetchAccount(item.handle);
        
        // Fetch recent posts
        const postsInfo = await provider.fetchRecentPosts(item.handle);

        // Update Account details
        account = await prisma.competitorAccount.update({
          where: { id: account.id },
          data: {
            displayName: accInfo.displayName || account.displayName,
            bio: accInfo.bio || account.bio,
            followerCount: accInfo.followerCount !== null ? accInfo.followerCount : account.followerCount,
            followingCount: accInfo.followingCount !== null ? accInfo.followingCount : account.followingCount,
            postCount: accInfo.postCount !== null ? accInfo.postCount : account.postCount,
            profileUrl: accInfo.profileUrl || account.profileUrl,
            syncStatus: 'COMPLETED',
            lastSyncedAt: new Date(),
            sourceType: 'PUBLIC_WEB',
          },
        });

        // Insert posts
        for (const post of postsInfo) {
          const externalPostId = post.externalPostId || `url-${Buffer.from(post.url || '').toString('base64').substring(0, 20)}`;
          
          let engagementRate = null;
          if (accInfo.followerCount && accInfo.followerCount > 0 && post.likeCount !== undefined && post.commentCount !== undefined) {
            const totalEng = (post.likeCount || 0) + (post.commentCount || 0) + (post.shareCount || 0);
            engagementRate = parseFloat(((totalEng / accInfo.followerCount) * 100).toFixed(4));
          }

          await prisma.competitorPost.upsert({
            where: {
              organizationId_competitorAccountId_externalPostId: {
                organizationId,
                competitorAccountId: account.id,
                externalPostId,
              },
            },
            create: {
              organizationId,
              brandId,
              competitorId,
              competitorAccountId: account.id,
              platform: item.name,
              externalPostId,
              url: post.url,
              publishedAt: post.publishedAt,
              captionText: post.captionText,
              mediaType: post.mediaType,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              shareCount: post.shareCount,
              viewCount: post.viewCount,
              engagementRate,
              sourceType: 'PUBLIC_WEB',
              rawMetadata: post.rawMetadata || {},
            },
            update: {
              url: post.url,
              publishedAt: post.publishedAt,
              captionText: post.captionText,
              mediaType: post.mediaType,
              likeCount: post.likeCount,
              commentCount: post.commentCount,
              shareCount: post.shareCount,
              viewCount: post.viewCount,
              engagementRate,
              rawMetadata: post.rawMetadata || {},
            },
          });
        }

        console.log(`[IngestionWorker] Completed platform ${item.name} sync for competitor ${competitorId}. Ingested ${postsInfo.length} posts.`);

      } catch (err: any) {
        console.error(`[IngestionWorker] Failed platform ${item.name} sync: ${err.message}`);
        await prisma.competitorAccount.update({
          where: { id: account.id },
          data: { 
            syncStatus: 'FAILED',
            lastSyncedAt: new Date(),
          },
        });
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

competitorIngestionWorker.on('failed', (job, err) => {
  console.error(`[IngestionWorker] Job ${job?.id} failed with error: ${err.message}`);
});
