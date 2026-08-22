import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  saveBrandBasics,
  saveBrandProducts,
  saveBrandAudience,
  saveBrandPositioning,
  saveBrandCompetitors,
  submitBrandOnboarding,
  getIncompleteDraft
} from '../../src/app/(dashboard)/brand/onboarding/actions';

// Mock dependencies
vi.mock('@abge/auth', () => ({
  requireAuth: vi.fn(),
  requirePermission: vi.fn(),
}));

const { mockCreateBrand, mockUpdateBrand, mockFindUniqueBrand } = vi.hoisted(() => ({
  mockCreateBrand: vi.fn(),
  mockUpdateBrand: vi.fn(),
  mockFindUniqueBrand: vi.fn(),
}));

vi.mock('@abge/tenant', () => {
  return {
    TenantRepository: class {
      createBrand = mockCreateBrand;
      updateBrand = mockUpdateBrand;
      findUniqueBrand = mockFindUniqueBrand;
      findManyBrands = vi.fn();
      findManyBrandProducts = vi.fn().mockResolvedValue([]);
      deleteBrandProduct = vi.fn();
      createBrandProduct = vi.fn();
      findManyBrandCompetitors = vi.fn().mockResolvedValue([]);
      deleteBrandCompetitor = vi.fn();
      createBrandCompetitor = vi.fn();
    }
  };
});

vi.mock('@/lib/queue', () => ({
  enqueueBrandDnaGeneration: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { requireAuth, requirePermission } from '@abge/auth';
import { TenantRepository } from '@abge/tenant';
import { enqueueBrandDnaGeneration } from '@/lib/queue';

describe('Brand Onboarding Server Actions', () => {
  const mockSession = { userId: 'user-1', organizationId: 'org-1' };
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (requireAuth as any).mockResolvedValue(mockSession);
    (requirePermission as any).mockResolvedValue(mockSession);
    
    mockCreateBrand.mockClear();
    mockUpdateBrand.mockClear();
    mockFindUniqueBrand.mockClear();
  });

  describe('saveBrandBasics', () => {
    it('creates a new draft if no brandId is provided', async () => {
      mockCreateBrand.mockResolvedValue({ id: 'brand-1' });
      
      const res = await saveBrandBasics({ name: 'Acme', industry: 'Tech', websiteUrl: 'https://acme.com' });
      
      expect(requirePermission).toHaveBeenCalledWith('manage_brand_dna');
      expect(mockCreateBrand).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Acme', onboardingStep: 2, onboardingStatus: 'DRAFT' })
      });
      expect(res).toBe('brand-1');
    });
  });

  describe('submitBrandOnboarding', () => {
    it('validates required fields before submitting', async () => {
      mockFindUniqueBrand.mockResolvedValue({
        id: 'brand-1',
        name: 'Acme',
        // missing industry and others
      });

      await expect(submitBrandOnboarding('brand-1')).rejects.toThrow('Missing required onboarding data');
    });

    it('enqueues job and updates status on success', async () => {
      mockFindUniqueBrand.mockResolvedValue({
        id: 'brand-1',
        name: 'Acme',
        industry: 'Tech',
        targetAudience: 'Devs',
        positioning: 'Best',
      });

      await submitBrandOnboarding('brand-1');

      expect(mockUpdateBrand).toHaveBeenCalledWith({
        where: { id: 'brand-1' },
        data: { onboardingStatus: 'GENERATING' }
      });
      expect(enqueueBrandDnaGeneration).toHaveBeenCalledWith('org-1', 'brand-1');
    });
  });
});
