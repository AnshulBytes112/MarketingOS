import { Queue, Worker } from 'bullmq';
import { prisma } from '@abge/database';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const scheduleQueue = new Queue('competitor-scheduler', { connection: redisConnection });
const competitorIngestionQueue = new Queue('competitor-ingestion', { connection: redisConnection });

export const schedulerWorker = new Worker(
  'competitor-scheduler',
  async () => {
    console.log('[SchedulerWorker] Starting daily scheduled competitor ingestion trigger...');
    try {
      const competitors = await prisma.brandCompetitor.findMany({
        select: {
          id: true,
          organizationId: true,
          brandId: true,
        }
      });

      console.log(`[SchedulerWorker] Found ${competitors.length} competitors to sync.`);
      for (const competitor of competitors) {
        await competitorIngestionQueue.add('competitor-ingestion.run', {
          organizationId: competitor.organizationId,
          brandId: competitor.brandId,
          competitorId: competitor.id,
        }, {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 1000,
          }
        });
        console.log(`[SchedulerWorker] Enqueued sync job for competitor ${competitor.id}`);
      }
    } catch (err: any) {
      console.error(`[SchedulerWorker] Failed to trigger daily ingestion: ${err.message}`);
    }
  },
  { connection: redisConnection }
);

export async function initializeScheduler() {
  try {
    const repeatableJobs = await scheduleQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await scheduleQueue.removeRepeatableByKey(job.key);
    }

    await scheduleQueue.add(
      'daily-trigger',
      {},
      {
        repeat: {
          pattern: '0 0 * * *',
        },
      }
    );
    console.log('[Scheduler] Initialized daily competitor ingestion repeating job (0 0 * * *).');
  } catch (err: any) {
    console.error(`[Scheduler] Failed to initialize daily repeatable job: ${err.message}`);
  }
}
