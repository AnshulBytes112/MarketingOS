import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantRepository } from '../../src/lib/db/repository';
import { prisma } from '../../src/lib/db/index';

// Mock the prisma client
vi.mock('../../src/lib/db/index', () => ({
  prisma: {
    brand: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    organizationMember: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('TenantRepository', () => {
  const orgId = 'org-123';
  let repo: TenantRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new TenantRepository({ organizationId: orgId });
  });

  it('requires an organizationId in context', () => {
    expect(() => new TenantRepository({ organizationId: '' })).toThrow(
      'OrganizationContext must include a valid organizationId'
    );
  });

  it('automatically injects organizationId in findManyBrands', async () => {
    await repo.findManyBrands({ where: { name: 'Acme' } });

    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: {
        name: 'Acme',
        organizationId: orgId,
      },
    });
  });

  it('automatically injects organizationId in createBrand', async () => {
    await repo.createBrand({ data: { name: 'New Brand' } });

    expect(prisma.brand.create).toHaveBeenCalledWith({
      data: {
        name: 'New Brand',
        organization: { connect: { id: orgId } },
      },
    });
  });
});
