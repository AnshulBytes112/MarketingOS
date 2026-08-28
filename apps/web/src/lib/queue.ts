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

let _strategyQueue: Queue | null = null;
export const getStrategyQueue = () => {
  if (!_strategyQueue) {
    _strategyQueue = new Queue('strategy', { connection: redisConnection });
  }
  return _strategyQueue;
};

export async function enqueueStrategyGeneration(params: {
  organizationId: string;
  brandId: string;
  strategyId: string;
  userId?: string;
  source?: string;
}) {
  return getStrategyQueue().add('strategy.generate', params, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

let _contentPlanQueue: Queue | null = null;
export const getContentPlanQueue = () => {
  if (!_contentPlanQueue) {
    _contentPlanQueue = new Queue('content-plan', { connection: redisConnection });
  }
  return _contentPlanQueue;
};

export async function enqueueContentPlanGeneration(params: {
  organizationId: string;
  brandId: string;
  strategyId: string;
  userId?: string;
}) {
  return getContentPlanQueue().add('content-plan.generate', params, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

let _textGenerationQueue: Queue | null = null;
export const getTextGenerationQueue = () => {
  if (!_textGenerationQueue) {
    _textGenerationQueue = new Queue('text-generation', { connection: redisConnection });
  }
  return _textGenerationQueue;
};

export async function enqueueTextGeneration(params: {
  generationId: string;
  organizationId: string;
  brandId: string;
  contentItemId: string;
}) {
  return getTextGenerationQueue().add(`text:${params.generationId}`, params, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

let _imageGenerationQueue: Queue | null = null;
export const getImageGenerationQueue = () => {
  if (!_imageGenerationQueue) {
    _imageGenerationQueue = new Queue('image-generation', { connection: redisConnection });
  }
  return _imageGenerationQueue;
};

export async function enqueueImageGeneration(params: {
  generationId: string;
  organizationId: string;
  brandId: string;
  contentItemId: string;
}) {
  return getImageGenerationQueue().add(`image:${params.generationId}`, params, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

let _videoGenerationQueue: Queue | null = null;
export const getVideoGenerationQueue = () => {
  if (!_videoGenerationQueue) {
    _videoGenerationQueue = new Queue('video-generation', { connection: redisConnection });
  }
  return _videoGenerationQueue;
};

export async function enqueueVideoGeneration(params: {
  generationId: string;
  organizationId: string;
  brandId: string;
  contentItemId: string;
}) {
  return getVideoGenerationQueue().add(`video:${params.generationId}`, params, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

let _qualityScoringQueue: Queue | null = null;
export const getQualityScoringQueue = () => {
  if (!_qualityScoringQueue) {
    _qualityScoringQueue = new Queue('quality-scoring', { connection: redisConnection });
  }
  return _qualityScoringQueue;
};

export async function enqueueQualityScoring(params: {
  generationId: string;
  organizationId: string;
  brandId: string;
  contentVersionId: string;
}) {
  return getQualityScoringQueue().add(`quality-score:${params.contentVersionId}`, params, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    jobId: `quality-score:${params.contentVersionId}` // Deterministic jobId for idempotency
  });
}
