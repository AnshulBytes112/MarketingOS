import { DirectDatabaseContextProvider } from './content-context.provider';
import { prisma } from '@abge/database';

jest.mock('@abge/database', () => ({
  prisma: {
    contentItem: {
      findUnique: jest.fn(),
    },
    brandDNAVersion: {
      findFirst: jest.fn(),
    },
    brandAsset: {
      findMany: jest.fn(),
    },
  },
}));

describe('DirectDatabaseContextProvider', () => {
  let provider: DirectDatabaseContextProvider;

  beforeEach(() => {
    provider = new DirectDatabaseContextProvider();
    jest.clearAllMocks();
  });

  it('should fetch context and perform relevance scoring for sources', async () => {
    // Mock ContentItem
    (prisma.contentItem.findUnique as jest.Mock).mockResolvedValue({
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
    });

    // Mock BrandDNA
    (prisma.brandDNAVersion.findFirst as jest.Mock).mockResolvedValue({
      id: 'dna-1',
      version: 3,
      tone: 'Friendly',
    });

    // Mock BrandAssets (Sources)
    (prisma.brandAsset.findMany as jest.Mock).mockResolvedValue([
      { id: 'asset-1', extractedText: 'A completely irrelevant document.', createdAt: new Date('2026-01-01') },
      { id: 'asset-2', extractedText: 'Details about the Summer Sale promotions and discounts.', createdAt: new Date('2026-06-01') },
    ]);

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
    (prisma.contentItem.findUnique as jest.Mock).mockResolvedValue({
      id: 'item-1',
      organizationId: 'org-1',
      brandId: 'brand-1',
      strategy: { id: 'strat-1', version: 2, publicationStatus: 'DRAFT', status: 'GENERATING' },
    });

    await expect(provider.getContext('item-1', 'brand-1', 'org-1')).rejects.toThrow('STRATEGY_NOT_AVAILABLE');
  });
});
