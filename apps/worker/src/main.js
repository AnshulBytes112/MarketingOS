"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const extractor_1 = require("./extractor");
const client_1 = require("@prisma/client");
const client_s3_1 = require("@aws-sdk/client-s3");
const prisma = new client_1.PrismaClient();
const s3Client = new client_s3_1.S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
});
async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
exports.worker = new bullmq_1.Worker('brand-asset', async (job) => {
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
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET || '',
            Key: asset.url
        });
        const response = await s3Client.send(command);
        if (!response.Body) {
            throw new Error('S3 object body is empty');
        }
        const buffer = await streamToBuffer(response.Body);
        // Extract Text using real pdf-parse
        const extractedText = await (0, extractor_1.extractPdfText)(buffer);
        // Set COMPLETED
        await prisma.brandAsset.update({
            where: { id: assetId },
            data: {
                extractionStatus: 'COMPLETED',
                extractedText
            }
        });
        console.log(`Extraction complete for asset: ${assetId}`);
    }
    catch (error) {
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
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});
exports.worker.on('failed', (job, err) => {
    console.error(`Asset Job ${job?.id} failed:`, err.message);
});
console.log('Worker is running for brand-asset and brand-dna queues...');
