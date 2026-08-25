import * as dotenv from 'dotenv';
dotenv.config();
import { brandDnaWorker } from '../apps/worker/src/brand-dna.worker';

brandDnaWorker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

brandDnaWorker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

console.log('Worker test script running...');
setTimeout(() => console.log('Timeout reached'), 15000);
