import { Queue } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

async function main() {
  const queue = new Queue('seo-analysis', { connection: redisConnection });
  const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
  console.log(`Total jobs in queue: ${jobs.length}`);
  for (const job of jobs) {
    console.log(`Job ID: ${job.id}, Name: ${job.name}, State: ${await job.getState()}`);
    console.log('Job Data:', JSON.stringify(job.data, null, 2));
    console.log('Failed Reason:', job.failedReason);
  }
}
main().catch(console.error).finally(() => process.exit(0));
