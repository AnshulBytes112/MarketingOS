"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandDnaWorker = void 0;
const bullmq_1 = require("bullmq");
const client_1 = require("@prisma/client");
const gateway_1 = require("./ai/gateway");
const brand_dna_schema_1 = require("./brand-dna.schema");
const confidence_1 = require("./confidence");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
const gateway = new gateway_1.ModelGateway();
const BrandDNAStatus = {
    GENERATING: 'GENERATING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
};
exports.brandDnaWorker = new bullmq_1.Worker('brand-dna', async (job) => {
    const { organizationId, brandId } = job.data;
    const requestId = (0, crypto_1.randomUUID)();
    console.log(`[${requestId}] Processing Brand DNA for brand: ${brandId}`);
    // Fetch all necessary data
    const [brand, products, competitors, assets, previousVersions] = await Promise.all([
        prisma.brand.findUnique({ where: { id: brandId, organizationId } }),
        prisma.brandProduct.findMany({ where: { brandId, organizationId } }),
        prisma.brandCompetitor.findMany({ where: { brandId, organizationId } }),
        prisma.brandAsset.findMany({ where: { brandId, organizationId } }),
        prisma.brandDNAVersion.findMany({
            where: { brandId, organizationId },
            orderBy: { version: 'desc' }
        })
    ]);
    if (!brand) {
        throw new Error('Brand not found or unauthorized');
    }
    const newVersionNumber = previousVersions.length > 0 ? previousVersions[0].version + 1 : 1;
    // Use the extracted Confidence Calculation
    const { confidenceScore, sources, extractedTextData } = (0, confidence_1.calculateBrandEvidenceConfidence)({
        brand,
        products,
        competitors,
        assets
    });
    // Ensure idempotency for duplicate jobs
    const existingJobVersion = await prisma.brandDNAVersion.findFirst({
        where: {
            brandId,
            organizationId,
            status: BrandDNAStatus.GENERATING, // If it's already generating, this might be a retry, we'll just update it
        }
    });
    const versionRecord = existingJobVersion || await prisma.brandDNAVersion.create({
        data: {
            organizationId,
            brandId,
            version: newVersionNumber,
            status: BrandDNAStatus.GENERATING,
            confidenceScore,
            sources,
        }
    });
    try {
        const systemPrompt = `You are an expert Brand Strategist AI. Generate a comprehensive Brand DNA based on the provided inputs. Ensure the output strictly adheres to the requested JSON schema.`;
        const userPrompt = `
      Brand Name: ${brand.name}
      Industry: ${brand.industry || 'Unknown'}
      Website: ${brand.websiteUrl || 'None'}
      Audience: ${brand.targetAudience || 'Unknown'}
      Positioning: ${brand.positioning || 'Unknown'}
      USP: ${brand.usp || 'Unknown'}
      
      Products: ${products.map((p) => p.name).join(', ')}
      Competitors: ${competitors.map((c) => c.name).join(', ')}
      
      Extracted Documents Context:
      ${extractedTextData}
    `;
        const result = await gateway.generateStructured(null, // uses env AI_MODEL
        systemPrompt, userPrompt, brand_dna_schema_1.BrandDNASchema, 'BrandDNA', 'Structured brand intelligence data', requestId);
        // Record usage
        await prisma.aIUsage.create({
            data: {
                organizationId,
                brandId,
                requestId,
                provider: process.env.AI_PROVIDER || 'openai',
                model: process.env.AI_MODEL || 'gpt-4o-mini',
                inputTokens: result.usage.inputTokens,
                outputTokens: result.usage.outputTokens,
                totalTokens: result.usage.totalTokens,
                latencyMs: result.usage.latencyMs,
                estimatedCost: result.usage.estimatedCost,
                status: 'SUCCESS'
            }
        });
        // Save success
        await prisma.brandDNAVersion.update({
            where: { id: versionRecord.id },
            data: {
                status: BrandDNAStatus.COMPLETED,
                completedAt: new Date(),
                personality: result.data.personality,
                voice: result.data.voice,
                tone: result.data.tone,
                positioning: result.data.positioning,
                visualIdentitySummary: result.data.visualIdentitySummary,
                audience: result.data.audience,
                contentPillars: result.data.contentPillars,
                language: result.data.language,
                ctaPreferences: result.data.ctaPreferences,
                avoidList: result.data.avoidList,
                claims: result.data.claims,
                constraints: result.data.constraints,
            }
        });
        // Update Brand status
        await prisma.brand.update({
            where: { id: brandId },
            data: { onboardingStatus: 'ACTIVE' }
        });
        console.log(`[${requestId}] Brand DNA generation complete for brand: ${brandId}`);
    }
    catch (error) {
        console.error(`[${requestId}] Brand DNA generation failed:`, error);
        // Save failure
        await prisma.brandDNAVersion.update({
            where: { id: versionRecord.id },
            data: {
                status: BrandDNAStatus.FAILED,
                completedAt: new Date(),
            }
        });
        // Optionally log AI usage failure if there were partial results (omitted for brevity)
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});
exports.brandDnaWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});
