import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: 'http://localhost:9000',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
  forcePathStyle: true,
});

async function main() {
  try {
    await client.send(new CreateBucketCommand({ Bucket: 'ai-brand-growth-assets' }));
    console.log('Bucket created!');
  } catch (e) {
    console.error(e);
  }
}
main();
