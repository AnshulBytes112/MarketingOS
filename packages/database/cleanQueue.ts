import { Queue } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

async function main() {
  const queue = new Queue('seo-analysis', { connection: redisConnection });
  await queue.drain(true);
  await queue.clean(0, 1000, 'failed');
  await queue.clean(0, 1000, 'completed');
  console.log('SEO Analysis Queue cleaned!');
}
main().catch(console.error).finally(() => process.exit(0));
