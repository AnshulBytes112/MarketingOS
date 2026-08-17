import { Queue, Worker } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Re-use connection to avoid exhausting Redis pool
export const brandDnaQueue = new Queue('brand-dna', {
  connection: redisConnection,
});

export async function enqueueBrandDnaGeneration(organizationId: string, brandId: string) {
  return brandDnaQueue.add('brand-dna.generate', {
    organizationId,
    brandId,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}
