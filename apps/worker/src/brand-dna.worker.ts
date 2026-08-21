import { Worker } from 'bullmq';
import { PrismaClient, BrandDNAStatus } from '@prisma/client';
import { ModelGateway } from './ai/gateway';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
const gateway = new ModelGateway();

const BrandDNASchema = z.object({
  personality: z.string().describe("Brand personality description"),
  voice: z.string().describe("Brand voice description"),
  tone: z.string().describe("Brand tone description"),
  positioning: z.string().describe("Positioning statement"),
  visualIdentitySummary: z.string().describe("Summary of visual identity"),
  audience: z.string().describe("Primary and secondary audience"),
  contentPillars: z.array(z.object({
    name: z.string(),
    percentage: z.number(),
    color: z.string(),
    textColor: z.string()
  })).describe("5 content pillars summing to 100%"),
  language: z.string().describe("Language characteristics"),
  ctaPreferences: z.string().describe("Call to action style"),
  avoidList: z.array(z.string()).describe("List of things to avoid"),
  claims: z.array(z.string()).describe("Verified claims to use"),
  constraints: z.array(z.string()).describe("Hard constraints")
});

export const brandDnaWorker = new Worker('brand-dna', async (job) => {
  const { organizationId, brandId } = job.data;
  const requestId = randomUUID();
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

  // Confidence Calculation
  let confidenceScore = 50; // Base score
  const sources: string[] = [];

  if (brand.industry) { confidenceScore += 5; sources.push('Brand Industry (Onboarding)'); }
  if (brand.targetAudience) { confidenceScore += 10; sources.push('Target Audience (Onboarding)'); }
  if (brand.positioning) { confidenceScore += 10; sources.push('Positioning (Onboarding)'); }
  if (brand.usp) { confidenceScore += 10; sources.push('USP (Onboarding)'); }
  
  if (products.length > 0) {
    confidenceScore += 10;
    sources.push(`Products Catalog (${products.length} products)`);
  }
  
  if (competitors.length > 0) {
    confidenceScore += 5;
    sources.push(`Competitor Analysis (${competitors.length} competitors)`);
  }

  let extractedTextData = '';
  assets.forEach(asset => {
    if (asset.extractionStatus === 'COMPLETED' && asset.extractedText) {
      confidenceScore += 10; // Max out but cap later
      sources.push(asset.fileName || 'Extracted Document');
      extractedTextData += `\n--- Document: ${asset.fileName || 'Unknown'} ---\n${asset.extractedText}\n`;
    }
  });

  confidenceScore = Math.min(confidenceScore, 98); // Cap at 98%

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
      
      Products: ${products.map(p => p.name).join(', ')}
      Competitors: ${competitors.map(c => c.name).join(', ')}
      
      Extracted Documents Context:
      ${extractedTextData}
    `;

    const result = await gateway.generateStructured(
      'gpt-4o-mini',
      systemPrompt,
      userPrompt,
      BrandDNASchema,
      'BrandDNA',
      'Structured brand intelligence data',
      requestId
    );

    // Record usage
    await prisma.aIUsage.create({
      data: {
        organizationId,
        brandId,
        requestId,
        provider: 'openai',
        model: 'gpt-4o-mini',
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

  } catch (error: any) {
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

brandDnaWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
