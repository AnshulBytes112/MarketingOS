const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

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
      return;
    }
  }

  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: 'ai-brand-growth-assets',
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }));
    console.log('CORS policy configured successfully for bucket!');
  } catch (error) {
    console.error('Failed to configure CORS:', error);
  }
}

run();
