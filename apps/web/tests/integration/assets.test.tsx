import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssets, deleteAssetAction, enqueueAssetExtraction } from '../../src/app/(dashboard)/brand/actions';
import { requireAuth, requirePermission } from '@abge/auth';
import { TenantRepository } from '@abge/tenant';
import { s3 } from '@/lib/s3';

vi.mock('@abge/auth', () => ({
  requireAuth: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock('@abge/tenant', () => {
  return {
    TenantRepository: vi.fn().mockImplementation(() => ({
      findManyBrandAssets: vi.fn().mockResolvedValue([{ id: 'asset-1', brandId: 'brand-1' }]),
      findUniqueBrandAsset: vi.fn(),
      deleteBrandAsset: vi.fn(),
    })),
  };
});

vi.mock('@/lib/s3', () => ({
  s3: {
    deleteObject: vi.fn().mockResolvedValue({}),
    generateSignedDownloadUrl: vi.fn().mockResolvedValue('https://s3/url'),
  }
}));

vi.mock('@/lib/queue', () => ({
  brandAssetQueue: {
    add: vi.fn().mockResolvedValue({}),
  }
}));

describe('Brand Assets Server Actions', () => {
  const mockSession = { userId: 'user-1', organizationId: 'org-A' };
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (requireAuth as any).mockResolvedValue(mockSession);
    (requirePermission as any).mockResolvedValue(mockSession);
    
    mockRepo = new TenantRepository(mockSession);
  });

  describe('Tenant Isolation', () => {
    it('getAssets only returns assets for the authenticated org', async () => {
      await getAssets('brand-1');
      // The TenantRepository constructor is called with org-A session
      // Thus all internal Prisma queries enforce organizationId: 'org-A'
      expect(TenantRepository).toHaveBeenCalledWith(mockSession);
      expect(mockRepo.findManyBrandAssets).toHaveBeenCalledWith({
        where: { brandId: 'brand-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('deleteAsset rejects if asset not found or wrong org', async () => {
      mockRepo.findUniqueBrandAsset.mockResolvedValue(null);
      await expect(deleteAssetAction('asset-2')).rejects.toThrow('Asset not found or access denied');
    });
  });

  describe('RBAC', () => {
    it('deleteAsset requires manage_brand_dna permission', async () => {
      mockRepo.findUniqueBrandAsset.mockResolvedValue({ id: 'asset-1', url: 's3/path' });
      await deleteAssetAction('asset-1');
      expect(requirePermission).toHaveBeenCalledWith('manage_brand_dna');
    });
  });

  describe('CRUD & S3', () => {
    it('deleteAsset deletes from S3 and DB', async () => {
      mockRepo.findUniqueBrandAsset.mockResolvedValue({ id: 'asset-1', url: 's3/path' });
      await deleteAssetAction('asset-1');
      
      expect(s3.deleteObject).toHaveBeenCalledWith('s3/path');
      expect(mockRepo.deleteBrandAsset).toHaveBeenCalledWith({ where: { id: 'asset-1' } });
    });
  });
});
