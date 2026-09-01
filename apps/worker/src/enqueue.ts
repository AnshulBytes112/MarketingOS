import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '@abge/database';
import { Queue } from 'bullmq';

async function main() {
  const brand = await prisma.brand.findFirst();
  if (!brand) return console.log('No brand found');

  const dnaQueue = new Queue('brand-dna', {
    connection: { 
      host: process.env.REDIS_HOST || 'localhost', 
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379 
    }
  });

  await dnaQueue.add('generate', {
    organizationId: brand.organizationId,
    brandId: brand.id,
  });

  console.log('Enqueued Brand DNA generation for brand', brand.id);
  await prisma.$disconnect();
  await dnaQueue.close();
}

main().catch(console.error);
