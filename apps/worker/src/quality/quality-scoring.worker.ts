import { Worker } from 'bullmq';
import { QualityScoringService } from './quality-scoring.service';
import { prisma } from '@abge/database';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const qualityScoringService = new QualityScoringService();

export const qualityScoringWorker = new Worker(
  'quality-scoring',
  async (job) => {
    const { generationId, organizationId, brandId, contentVersionId } = job.data;
    
    // Check if it's already scored
    const existing = await prisma.contentGeneration.findUnique({ where: { id: contentVersionId } });
    if (!existing) {
      console.error(`Job failed: ContentVersion ${contentVersionId} not found.`);
      return;
    }
    
    if (existing.scoringStatus === 'SCORED') {
      console.log(`ContentVersion ${contentVersionId} is already scored. Skipping...`);
      return;
    }

    console.log(`Starting Quality Scoring for ContentVersion ${contentVersionId}...`);

    try {
      const scoreData = await qualityScoringService.scoreContentVersion(contentVersionId, organizationId, brandId);
      console.log(`Quality Scoring completed for ContentVersion ${contentVersionId} with composite score: ${scoreData.composite}`);
      return scoreData;
    } catch (error) {
      console.error(`Quality Scoring failed for ContentVersion ${contentVersionId}:`, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

qualityScoringWorker.on('failed', (job, err) => {
  console.error(`Job failed in qualityScoringWorker (ID: ${job?.id}):`, err);
});
