import { prisma } from '@abge/database';
import { ModelGateway } from '../ai/gateway';
import { DirectDatabaseContextProvider } from '../ai/content-context.provider';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const gateway = new ModelGateway();
const contextProvider = new DirectDatabaseContextProvider();

const QualityScoreAiSchema = z.object({
  brandVoice: z.object({
    score: z.number().min(0).max(100),
    reason: z.string(),
    flags: z.array(z.object({
      type: z.string(),
      severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
      message: z.string()
    }))
  }),
  factualSafety: z.object({
    score: z.number().min(0).max(100),
    reason: z.string(),
    flags: z.array(z.object({
      type: z.string(),
      severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
      message: z.string()
    }))
  }),
  ctaClarity: z.object({
    score: z.number().min(0).max(100),
    reason: z.string(),
    flags: z.array(z.object({
      type: z.string(),
      severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
      message: z.string()
    }))
  })
});

export class QualityScoringService {
  
  async scoreContentVersion(contentVersionId: string, organizationId: string, brandId: string) {
    const generation = await prisma.contentGeneration.findUnique({
      where: { id: contentVersionId },
      include: {
        contentItem: { include: { channel: true, strategy: true } }
      }
    });

    if (!generation || generation.organizationId !== organizationId) {
      throw new Error('ContentVersion not found or unauthorized');
    }
    
    if (generation.textStatus !== 'COMPLETED' || !generation.textContent) {
      throw new Error('Content is not completed or has no text content to score');
    }

    // Set status to SCORING
    await prisma.contentGeneration.update({
      where: { id: contentVersionId },
      data: { scoringStatus: 'SCORING' }
    });

    try {
      const ctx = await contextProvider.getContext(generation.contentItemId, brandId, organizationId);
      const contentStr = typeof generation.textContent === 'string' ? generation.textContent : JSON.stringify(generation.textContent);

      // Deterministic Scoring
      const readability = this.calculateReadability(contentStr);
      const platformFit = this.calculatePlatformFit(generation.contentItem, contentStr);
      
      // AI-Assisted Scoring (Brand Voice, Factual Safety, CTA Clarity)
      const requestId = randomUUID();
      const systemPrompt = `You are an expert Content Quality Evaluator. Evaluate the provided generated content against the context.
      
CONTEXT:
${ctx.context}

EVALUATION CRITERIA:
1. Brand Voice (0-100): Does the content match the requested tone, personality, and vocabulary?
2. Factual Safety (0-100): Are all claims supported by the provided sources? Flag unsupported statistics or facts. If a claim is unsupported, factual safety MUST be low (e.g. < 50).
3. CTA Clarity (0-100): Is the CTA present, specific, and aligned with the strategy?

Output structured data matching the schema. Provide a human-readable reason for each score.`;

      const userPrompt = `Content to evaluate:\n\n${contentStr}`;

      const aiResponse = await gateway.generateStructured(
        null,
        systemPrompt,
        userPrompt,
        QualityScoreAiSchema,
        'QualityScoreAiSchema',
        'Schema for evaluating brand voice, factual safety, and CTA',
        requestId
      );

      // Log AI usage
      await prisma.aIUsage.create({
        data: {
          organizationId,
          brandId,
          requestId,
          provider: process.env.AI_PROVIDER || 'gemini',
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          inputTokens: aiResponse.usage.inputTokens,
          outputTokens: aiResponse.usage.outputTokens,
          totalTokens: aiResponse.usage.totalTokens,
          latencyMs: aiResponse.usage.latencyMs,
          estimatedCost: aiResponse.usage.estimatedCost || 0,
          status: 'COMPLETED',
        },
      });

      const aiData = aiResponse.data;

      // Composite Score Calculation
      let composite = Math.round(
        (aiData.brandVoice.score * 0.25) +
        (aiData.factualSafety.score * 0.25) +
        (platformFit.score * 0.20) +
        (aiData.ctaClarity.score * 0.15) +
        (readability.score * 0.15)
      );

      // Safety Floor Enforcement
      if (aiData.factualSafety.score < 30) {
        composite = Math.min(composite, 39);
      } else if (aiData.factualSafety.score < 50) {
        composite = Math.min(composite, 59);
      }

      // Compile Flags and Reasons
      const flags = [
        ...aiData.brandVoice.flags.map(f => ({ ...f, dimension: 'BRAND_VOICE' })),
        ...aiData.factualSafety.flags.map(f => ({ ...f, dimension: 'FACTUAL_SAFETY' })),
        ...aiData.ctaClarity.flags.map(f => ({ ...f, dimension: 'CTA_CLARITY' })),
        ...readability.flags.map(f => ({ ...f, dimension: 'READABILITY' })),
        ...platformFit.flags.map(f => ({ ...f, dimension: 'PLATFORM_FIT' }))
      ];

      const subScores = {
        brandVoice: aiData.brandVoice.score,
        factualSafety: aiData.factualSafety.score,
        platformFit: platformFit.score,
        ctaClarity: aiData.ctaClarity.score,
        readability: readability.score,
      };

      const reasons = {
        brandVoice: aiData.brandVoice.reason,
        factualSafety: aiData.factualSafety.reason,
        platformFit: platformFit.reason,
        ctaClarity: aiData.ctaClarity.reason,
        readability: readability.reason,
      };

      const qualityScore = {
        composite,
        subScores,
        flags,
        reasons,
        scoredAt: new Date().toISOString(),
        scorerVersion: 'quality-v1'
      };

      await prisma.contentGeneration.update({
        where: { id: contentVersionId },
        data: {
          qualityScore,
          scoringStatus: 'SCORED'
        }
      });

      return qualityScore;
    } catch (err: any) {
      console.error('Quality Scoring Failed:', err);
      await prisma.contentGeneration.update({
        where: { id: contentVersionId },
        data: { scoringStatus: 'FAILED', errorLog: { scoringError: err.message } }
      });
      throw err;
    }
  }

  private calculateReadability(text: string) {
    const flags: any[] = [];
    let score = 100;
    
    // Penalize extreme jargon
    const jargonRegex = /\b(synergize|leverage|holistic ecosystem|paradigm shift|optimization framework)\b/gi;
    const jargonMatches = text.match(jargonRegex);
    if (jargonMatches && jargonMatches.length > 0) {
      score -= Math.min(jargonMatches.length * 10, 30);
      flags.push({ type: 'COMPLEX_LANGUAGE', severity: 'WARNING', message: 'The wording is more technical than necessary for the intended audience.' });
    }

    // Penalize long sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const overlyLong = sentences.filter(s => s.split(' ').length > 30);
    if (overlyLong.length > 0) {
      score -= overlyLong.length * 5;
      flags.push({ type: 'COMPLEX_LANGUAGE', severity: 'WARNING', message: 'Several sentences are longer than necessary.' });
    }

    return {
      score: Math.max(0, score),
      reason: score === 100 ? 'Text is easy to read and avoids unnecessary jargon.' : 'Text contains complex language or overly long sentences.',
      flags
    };
  }

  private calculatePlatformFit(item: any, text: string) {
    let score = 100;
    const flags: any[] = [];
    const charCount = text.length;

    if (item.platform.toUpperCase() === 'INSTAGRAM') {
      if (charCount > 2200) {
        score -= 30;
        flags.push({ type: 'FORMAT_MISMATCH', severity: 'WARNING', message: 'Instagram captions should typically be concise, this exceeds standard length significantly.' });
      }
    } else if (item.platform.toUpperCase() === 'TWITTER' || item.platform.toUpperCase() === 'X') {
      if (charCount > 280) {
        score -= 40;
        flags.push({ type: 'FORMAT_MISMATCH', severity: 'CRITICAL', message: 'Content exceeds Twitter/X 280 character limit (without threading structure).' });
      }
    }

    return {
      score: Math.max(0, score),
      reason: score === 100 ? `Fits standard best practices for ${item.platform}.` : `Content format violates some standard expectations for ${item.platform}.`,
      flags
    };
  }
}
