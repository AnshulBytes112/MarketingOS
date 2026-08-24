const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

async function main() {
  const s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  });

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: 'test/key',
    ContentType: 'image/png',
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    console.log('Success:', url);
  } catch (err) {
    console.error('Error generating URL:', err);
  }
}

main();
