import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBrandDna, regenerateBrandDna } from '../../src/app/(dashboard)/brand/actions';
import { requireAuth, requirePermission } from '@abge/auth';
import { prisma } from '@abge/database';
import { brandDnaQueue } from '@/lib/queue';

vi.mock('@abge/auth', () => ({
  requireAuth: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock('@abge/database', () => ({
  prisma: {
    brandDNAVersion: {
      findFirst: vi.fn(),
    },
    brand: {
      findFirst: vi.fn(),
    }
  }
}));

vi.mock('@/lib/queue', () => ({
  brandDnaQueue: {
    add: vi.fn().mockResolvedValue({}),
  }
}));

describe('Brand DNA Server Actions', () => {
  const mockSession = { userId: 'user-1', organizationId: 'org-A' };

  beforeEach(() => {
    vi.clearAllMocks();
    (requireAuth as any).mockResolvedValue(mockSession);
    (requirePermission as any).mockResolvedValue(mockSession);
  });

  describe('Tenant Isolation', () => {
    it('getBrandDna enforces organizationId in query', async () => {
      await getBrandDna('brand-1');
      
      expect(prisma.brandDNAVersion.findFirst).toHaveBeenCalledWith({
        where: { brandId: 'brand-1', organizationId: 'org-A' },
        orderBy: { version: 'desc' },
      });
    });

    it('regenerateBrandDna throws if brand belongs to another org', async () => {
      (prisma.brand.findFirst as any).mockResolvedValue(null);
      await expect(regenerateBrandDna('brand-2')).rejects.toThrow('Brand not found');
      
      expect(prisma.brand.findFirst).toHaveBeenCalledWith({
        where: { id: 'brand-2', organizationId: 'org-A' }
      });
      expect(brandDnaQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('RBAC', () => {
    it('regenerateBrandDna requires manage_brand_dna permission', async () => {
      (prisma.brand.findFirst as any).mockResolvedValue({ id: 'brand-1' });
      await regenerateBrandDna('brand-1');
      expect(requirePermission).toHaveBeenCalledWith('manage_brand_dna');
    });
  });

  describe('Queue Submission', () => {
    it('successfully enqueues a generation job', async () => {
      (prisma.brand.findFirst as any).mockResolvedValue({ id: 'brand-1' });
      const result = await regenerateBrandDna('brand-1');
      
      expect(result.success).toBe(true);
      expect(brandDnaQueue.add).toHaveBeenCalledWith(
        'brand-dna.generate',
        { organizationId: 'org-A', brandId: 'brand-1' },
        expect.any(Object)
      );
    });
  });
});
