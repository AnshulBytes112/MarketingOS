import { Worker } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { BrandDNASchema } from './brand-dna.schema';
import { calculateBrandEvidenceConfidence } from './confidence';
import { randomUUID } from 'crypto';

const gateway = new ModelGateway();

const BrandDNAStatus = {
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const brandDnaWorker = new Worker('brand-dna', async (job) => {
  const { organizationId, brandId, userId } = job.data;
  const requestId = randomUUID();
  const startTimeMs = performance.now();
  console.log(`[${requestId}] Processing Brand DNA for brand: ${brandId} by user: ${userId || 'SYSTEM'}`);

  // Fetch all necessary data
  const dbStartTime = performance.now();
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
  const dbPrepTimeMs = Math.round(performance.now() - dbStartTime);
  console.log(`[${requestId}] DB Prep took ${dbPrepTimeMs}ms`);

  if (!brand) {
    throw new Error('Brand not found or unauthorized');
  }

  const newVersionNumber = previousVersions.length > 0 ? previousVersions[0].version + 1 : 1;

  // Use the extracted Confidence Calculation
  const { confidenceScore, sources, extractedTextData } = calculateBrandEvidenceConfidence({
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
      createdById: userId || null,
    }
  });

  try {
    const systemPrompt = `You are an expert Brand Strategist AI. Generate a comprehensive Brand DNA based on the provided inputs. Ensure the output strictly adheres to the requested JSON format.
    
    You MUST output valid JSON with EXACTLY these keys:
    {
      "personality": "string (comma separated tags)",
      "voice": "string",
      "tone": "string",
      "positioning": "string",
      "visualIdentitySummary": "string",
      "audience": "string",
      "contentPillars": [
        { "name": "string", "percentage": 30, "color": "bg-purple-500", "textColor": "text-purple-400" }
      ],
      "language": "string",
      "ctaPreferences": "string",
      "avoidList": ["string"],
      "claims": ["string"],
      "constraints": ["string"],
      "demographics": [{"range": "string", "percentage": 30, "color": "bg-purple-500", "textColor": "text-purple-400"}],
      "inferredIndustry": "string",
      "inferredGeography": "string",
      "inferredPriceSegment": "string",
      "inferredWebsiteUrl": "string"
    }`;
      // Deterministic Chunk Selection instead of crude truncation
      const promptStartTime = performance.now();
      const maxChars = 20000;
      let optimizedTextData = extractedTextData;
      if (extractedTextData.length > maxChars) {
         // Score paragraphs based on relevance to Brand DNA
         const keywords = ['brand', 'mission', 'vision', 'audience', 'customer', 'tone', 'voice', 'value', 'positioning', 'strategy', 'goal', 'competitor'];
         const paragraphs = extractedTextData.split(/\n\s*\n/);
         const scored = paragraphs.map((p, index) => {
            const lowerP = p.toLowerCase();
            const score = keywords.reduce((s, k) => s + (lowerP.includes(k) ? 1 : 0), 0) + (index === 0 || index === paragraphs.length - 1 ? 2 : 0);
            return { text: p, score, index };
         });
         scored.sort((a, b) => b.score - a.score);
         
         let currentLen = 0;
         const selected = [];
         for (const p of scored) {
            if (currentLen + p.text.length > maxChars) break;
            selected.push(p);
            currentLen += p.text.length;
         }
         // Reorder by original position to maintain flow
         selected.sort((a, b) => a.index - b.index);
         optimizedTextData = selected.map(p => p.text).join('\n\n') + '\n\n...[TRUNCATED LESS RELEVANT SECTIONS]';
      }
      console.log(`[${requestId}] Prompt optimization took ${Math.round(performance.now() - promptStartTime)}ms`);

    const userPrompt = `
      Brand Name: ${brand.name}
      Industry: ${brand.industry || 'Unknown'}
      Website: ${brand.websiteUrl || 'None'}
      Audience: ${brand.targetAudience || 'Unknown'}
      Positioning: ${brand.positioning || 'Unknown'}
      USP: ${brand.usp || 'Unknown'}
      
      Products: ${products.map((p: any) => p.name).join(', ')}
      Competitors: ${competitors.map((c: any) => c.name).join(', ')}
      
      Extracted Documents Context:
      ${optimizedTextData}
    `;

    const result = await gateway.generateStructured(
      null, // uses env AI_MODEL
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

    const isFirstVersion = newVersionNumber === 1;

    // Save success
    await prisma.brandDNAVersion.update({
      where: { id: versionRecord.id },
      data: {
        status: BrandDNAStatus.COMPLETED,
        publicationStatus: isFirstVersion ? 'ACTIVE' : 'DRAFT',
        completedAt: new Date(),
        confidenceScore,
        sources,
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
        demographics: result.data.demographics,
      }
    });

    // Update Brand status and inferred fields
    await prisma.brand.update({
      where: { id: brandId },
      data: { 
        onboardingStatus: 'ACTIVE',
        industry: brand.industry || result.data.inferredIndustry,
        geography: brand.geography || result.data.inferredGeography,
        priceSegment: brand.priceSegment || result.data.inferredPriceSegment,
        websiteUrl: brand.websiteUrl || result.data.inferredWebsiteUrl,
        targetAudience: brand.targetAudience || result.data.audience,
        positioning: brand.positioning || result.data.positioning,
      }
    });

    // Create AuditLog if user triggered
    if (userId) {
      await prisma.auditLog.create({
        data: {
          organizationId,
          userId,
          action: 'BRAND_DNA_REGENERATED',
          entityType: 'BrandDNAVersion',
          entityId: versionRecord.id,
          metadata: {
            source: 'REGENERATED',
            requestId,
            version: newVersionNumber
          }
        }
      });
    }

    const totalDurationMs = Math.round(performance.now() - startTimeMs);
    console.log(`[${requestId}] Brand DNA generation complete for brand: ${brandId} in ${totalDurationMs}ms`);

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
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});

brandDnaWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

brandDnaWorker.on('error', err => {
  console.error(`Worker error:`, err);
});

brandDnaWorker.on('ready', () => {
  console.log('brandDnaWorker is READY and listening for jobs on brand-dna queue!');
});
