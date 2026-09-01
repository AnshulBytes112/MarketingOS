const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

async function main() {
  const bucket = process.env.S3_BUCKET || 'ai-brand-growth-assets';
  console.log('Configuring CORS for bucket:', bucket);

  const command = new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    await s3Client.send(command);
    console.log('CORS configured successfully');
  } catch (err) {
    console.error('Failed to configure CORS:', err);
  }
}

main();
