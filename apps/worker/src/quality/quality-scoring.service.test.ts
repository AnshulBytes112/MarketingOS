import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QualityScoringService } from './quality-scoring.service';

const mockPrismaClient = {
  contentGeneration: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  aIUsage: {
    create: vi.fn(),
  }
};

vi.mock('@abge/database', () => {
  return {
    get prisma() {
      return mockPrismaClient;
    }
  };
});

const mockGenerateStructured = vi.fn();
vi.mock('../ai/gateway', () => {
  return {
    ModelGateway: vi.fn(function() {
      return {
        get generateStructured() {
          return mockGenerateStructured;
        },
      };
    })
  };
});

const mockGetContext = vi.fn();
vi.mock('../ai/content-context.provider', () => {
  return {
    DirectDatabaseContextProvider: vi.fn(function() {
      return {
        get getContext() {
          return mockGetContext;
        },
      };
    })
  };
});

describe('QualityScoringService', () => {
  let service: QualityScoringService;

  beforeEach(() => {
    service = new QualityScoringService();
    vi.clearAllMocks();

    mockGetContext.mockResolvedValue({
      context: 'Brand DNA: Friendly. Sources: Sales went up by 50%.'
    });

    mockPrismaClient.aIUsage.create.mockResolvedValue({ id: 'usage-1' });
  });

  it('should enforce the safety floor when Factual Safety is very low', async () => {
    mockPrismaClient.contentGeneration.findUnique.mockResolvedValue({
      id: 'gen-1',
      organizationId: 'org-1',
      brandId: 'brand-1',
      textStatus: 'COMPLETED',
      textContent: 'Our product cures all diseases.', // Unsupported claim
      contentItem: { platform: 'INSTAGRAM', format: 'POST' }
    });

    mockGenerateStructured.mockResolvedValue({
      data: {
        brandVoice: { score: 95, reason: 'Matches tone', flags: [] },
        factualSafety: { 
          score: 25, 
          reason: 'Invented medical claims', 
          flags: [{ type: 'UNSUPPORTED_CLAIM', severity: 'CRITICAL', message: 'Medical claim not supported by source.' }] 
        },
        ctaClarity: { score: 90, reason: 'Clear CTA', flags: [] }
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, latencyMs: 1200 }
    });

    // Even if other scores are 100 (Readability/Platform Fit will be high here),
    // because factualSafety is < 30, composite must be max 39.
    const result = await service.scoreContentVersion('gen-1', 'org-1', 'brand-1');
    expect(result.composite).toBeLessThanOrEqual(39);
    expect(result.subScores.factualSafety).toBe(25);
    
    // Check if flags are aggregated
    expect(result.flags.some((f: any) => f.type === 'UNSUPPORTED_CLAIM')).toBeTruthy();
    expect(result.flags.some((f: any) => f.dimension === 'FACTUAL_SAFETY')).toBeTruthy();
  });

  it('should penalize complex jargon deterministically', async () => {
    mockPrismaClient.contentGeneration.findUnique.mockResolvedValue({
      id: 'gen-2',
      organizationId: 'org-1',
      brandId: 'brand-1',
      textStatus: 'COMPLETED',
      textContent: 'We must synergize our holistic ecosystem to create a paradigm shift.', // Jargon
      contentItem: { platform: 'LINKEDIN', format: 'POST' }
    });

    mockGenerateStructured.mockResolvedValue({
      data: {
        brandVoice: { score: 90, reason: '', flags: [] },
        factualSafety: { score: 100, reason: '', flags: [] },
        ctaClarity: { score: 80, reason: '', flags: [] }
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, latencyMs: 1200 }
    });

    const result = await service.scoreContentVersion('gen-2', 'org-1', 'brand-1');
    
    // Readability should be heavily penalized by the deterministic regex matching 'synergize', 'holistic ecosystem', 'paradigm shift'
    expect(result.subScores.readability).toBeLessThan(100);
    expect(result.flags.some((f: any) => f.type === 'COMPLEX_LANGUAGE')).toBeTruthy();
  });

  it('should penalize platform mismatch deterministically (e.g. extremely long tweet)', async () => {
    mockPrismaClient.contentGeneration.findUnique.mockResolvedValue({
      id: 'gen-3',
      organizationId: 'org-1',
      brandId: 'brand-1',
      textStatus: 'COMPLETED',
      textContent: 'a'.repeat(300), // > 280 chars
      contentItem: { platform: 'TWITTER', format: 'POST' }
    });

    mockGenerateStructured.mockResolvedValue({
      data: {
        brandVoice: { score: 90, reason: '', flags: [] },
        factualSafety: { score: 100, reason: '', flags: [] },
        ctaClarity: { score: 80, reason: '', flags: [] }
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150, latencyMs: 1200 }
    });

    const result = await service.scoreContentVersion('gen-3', 'org-1', 'brand-1');
    
    // Platform fit should be penalized for exceeding 280 chars on Twitter
    expect(result.subScores.platformFit).toBeLessThan(100);
    expect(result.flags.some((f: any) => f.type === 'FORMAT_MISMATCH')).toBeTruthy();
  });
});
