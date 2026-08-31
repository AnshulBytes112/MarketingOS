import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DirectDatabaseContextProvider } from './content-context.provider';
import { prisma } from '@abge/database';

vi.mock('@abge/database', () => ({
  prisma: {
    contentItem: {
      findUnique: vi.fn(),
    },
    brandDNAVersion: {
      findFirst: vi.fn(),
    },
    brandAsset: {
      findMany: vi.fn(),
    },
  },
}));

describe('DirectDatabaseContextProvider', () => {
  let provider: DirectDatabaseContextProvider;

  beforeEach(() => {
    provider = new DirectDatabaseContextProvider();
    vi.clearAllMocks();
  });

  it('should fetch context and perform relevance scoring for sources', async () => {
    // Mock ContentItem
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: 'item-1',
      organizationId: 'org-1',
      brandId: 'brand-1',
      title: 'Summer Sale',
      contentPillar: 'Promotions',
      funnelStage: 'BOFU',
      platform: 'INSTAGRAM',
      format: 'IMAGE',
      strategy: { id: 'strat-1', version: 2, publicationStatus: 'ACTIVE', status: 'COMPLETED' },
      channel: null,
    } as any);

    // Mock BrandDNA
    vi.mocked(prisma.brandDNAVersion.findFirst).mockResolvedValue({
      id: 'dna-1',
      version: 3,
      tone: 'Friendly',
    } as any);

    // Mock BrandAssets (Sources)
    vi.mocked(prisma.brandAsset.findMany).mockResolvedValue([
      { id: 'asset-1', extractedText: 'A completely irrelevant document.', createdAt: new Date('2026-01-01') },
      { id: 'asset-2', extractedText: 'Details about the Summer Sale promotions and discounts.', createdAt: new Date('2026-06-01') },
    ] as any);

    const result = await provider.getContext('item-1', 'brand-1', 'org-1');

    expect(result.brandDnaVersionId).toBe('dna-1');
    expect(result.strategyId).toBe('strat-1');
    expect(result.strategyVersion).toBe(2);
    expect(result.contentItemId).toBe('item-1');
    
    // Top asset should be asset-2 because it matches 'Summer Sale' and 'Promotions'
    expect(result.sourceIds).toContain('asset-2');
    expect(result.context).toContain('Details about the Summer Sale');
    expect(result.context).toContain('Friendly');
  });

  it('should throw an error if strategy is not ACTIVE or COMPLETED', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: 'item-1',
      organizationId: 'org-1',
      brandId: 'brand-1',
      strategy: { id: 'strat-1', version: 2, publicationStatus: 'DRAFT', status: 'GENERATING' },
    } as any);

    await expect(provider.getContext('item-1', 'brand-1', 'org-1')).rejects.toThrow('STRATEGY_NOT_AVAILABLE');
  });
});
