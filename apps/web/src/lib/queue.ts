import { Queue, Worker } from 'bullmq';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

let _brandDnaQueue: Queue | null = null;
export const getBrandDnaQueue = () => {
  if (!_brandDnaQueue) {
    _brandDnaQueue = new Queue('brand-dna', { connection: redisConnection });
  }
  return _brandDnaQueue;
};

let _brandAssetQueue: Queue | null = null;
export const getBrandAssetQueue = () => {
  if (!_brandAssetQueue) {
    _brandAssetQueue = new Queue('brand-asset', { connection: redisConnection });
  }
  return _brandAssetQueue;
};

export async function enqueueBrandDnaGeneration(organizationId: string, brandId: string, userId?: string) {
  return getBrandDnaQueue().add('brand-dna.generate', {
    organizationId,
    brandId,
    userId,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

let _competitorIngestionQueue: Queue | null = null;
export const getCompetitorIngestionQueue = () => {
  if (!_competitorIngestionQueue) {
    _competitorIngestionQueue = new Queue('competitor-ingestion', { connection: redisConnection });
  }
  return _competitorIngestionQueue;
};
