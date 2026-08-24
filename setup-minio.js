const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin'
  },
  forcePathStyle: true,
});

async function run() {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: 'ai-brand-growth-assets' }));
    console.log('Bucket created successfully!');
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
      console.log('Bucket already exists.');
    } else {
      console.error('Failed to create bucket:', error);
    }
  }
}

run();
