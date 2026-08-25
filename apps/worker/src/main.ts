import * as dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import { extractPdfText } from './extractor';
import { prisma } from '@abge/database';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { brandDnaWorker } from './brand-dna.worker';
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export const worker = new Worker('brand-asset', async (job) => {
  const { organizationId, brandId, assetId } = job.data;
  console.log(`Processing extraction for asset: ${assetId}`);

  // Validate ownership
  const asset = await prisma.brandAsset.findFirst({
    where: { id: assetId, organizationId, brandId }
  });

  if (!asset) {
    throw new Error('Asset not found or unauthorized');
  }

  // Set PROCESSING
  await prisma.brandAsset.update({
    where: { id: assetId },
    data: { extractionStatus: 'PROCESSING' }
  });

  try {
    // Download from S3
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || '',
      Key: asset.url
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new Error('S3 object body is empty');
    }

    const buffer = await streamToBuffer(response.Body as Readable);

    // Extract Text using real pdf-parse
    const extractedText = await extractPdfText(buffer);

    // Set COMPLETED
    await prisma.brandAsset.update({
      where: { id: assetId },
      data: {
        extractionStatus: 'COMPLETED',
        extractedText
      }
    });

    console.log(`Extraction complete for asset: ${assetId}`);

  } catch (error: any) {
    console.error(`Extraction failed for asset: ${assetId}`, error);
    
    // Set FAILED
    await prisma.brandAsset.update({
      where: { id: assetId },
      data: {
        extractionStatus: 'FAILED'
      }
    });
    
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

worker.on('failed', (job, err) => {
  console.error(`Asset Job ${job?.id} failed:`, err.message);
});

import { competitorIngestionWorker } from './competitor-ingestion.worker';
import { schedulerWorker, initializeScheduler } from './scheduler';
import { strategyWorker } from './strategy.worker';
import { contentPlanWorker } from './content-plan.worker';

console.log('Worker is running for brand-asset, brand-dna, competitor-ingestion, strategy, content-plan queues...');
console.log('Registered brandDnaWorker:', !!brandDnaWorker);
console.log('Registered competitorIngestionWorker:', !!competitorIngestionWorker);
console.log('Registered schedulerWorker:', !!schedulerWorker);
console.log('Registered strategyWorker:', !!strategyWorker);
console.log('Registered contentPlanWorker:', !!contentPlanWorker);

initializeScheduler().then(() => {
  console.log('Scheduler initialization complete.');
}).catch((err) => {
  console.error('Failed to initialize scheduler:', err);
});
