// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Queue } = require('bullmq');

(async () => {
  const q = new Queue('strategy', {
    connection: { host: '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') },
  });

  const counts = await q.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
  console.log('Strategy queue counts:', JSON.stringify(counts, null, 2));

  const failed = await q.getFailed(0, 5);
  console.log('Failed jobs:', JSON.stringify(failed.map(j => ({
    id: j.id,
    failedReason: j.failedReason,
    data: j.data,
  })), null, 2));

  const waiting = await q.getWaiting(0, 5);
  console.log('Waiting jobs:', JSON.stringify(waiting.map(j => ({ id: j.id, data: j.data })), null, 2));

  const active = await q.getActive(0, 5);
  console.log('Active jobs:', JSON.stringify(active.map(j => ({ id: j.id, data: j.data })), null, 2));

  await q.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
