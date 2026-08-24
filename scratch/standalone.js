const { Worker } = require('bullmq');

const w = new Worker('brand-dna', async (job) => {
  console.log('RECEIVED JOB', job.id);
}, {
  connection: { host: 'localhost', port: 6379 }
});

w.on('ready', () => console.log('Standalone Worker Ready!'));
w.on('error', err => console.log('Standalone error', err));
w.on('failed', (job, err) => console.log('Standalone failed', err));
w.on('completed', (job) => console.log('Standalone completed', job.id));
