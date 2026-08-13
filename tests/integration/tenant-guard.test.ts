import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TenantRepository } from '../../src/lib/db/repository';
import { prisma } from '../../src/lib/db/index';
import type { Organization, User } from '@prisma/client';

describe('TenantRepository Integration (REAL DB)', () => {
  let orgA: Organization;
  let orgB: Organization;
  let userA: User;
  let userB: User;

  beforeAll(async () => {
    // Setup test data in DB
    orgA = await prisma.organization.upsert({
      where: { slug: 'test-org-a' },
      update: {},
      create: { name: 'Test Org A', slug: 'test-org-a' },
    });
    orgB = await prisma.organization.upsert({
      where: { slug: 'test-org-b' },
      update: {},
      create: { name: 'Test Org B', slug: 'test-org-b' },
    });

    userA = await prisma.user.upsert({
      where: { email: 'userA@test.com' },
      update: {},
      create: { email: 'userA@test.com', name: 'User A' },
    });

    userB = await prisma.user.upsert({
      where: { email: 'userB@test.com' },
      update: {},
      create: { email: 'userB@test.com', name: 'User B' },
    });

    await prisma.brand.create({ data: { name: 'Brand A', organizationId: orgA.id } });
    await prisma.brand.create({ data: { name: 'Brand B', organizationId: orgB.id } });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.brand.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  });

  it('Org A user can read Org A brand', async () => {
    const repoA = new TenantRepository({ organizationId: orgA.id });
    const brands = await repoA.findManyBrands();
    expect(brands).toHaveLength(1);
    expect(brands[0].name).toBe('Brand A');
  });

  it('Org A user cannot read Org B brand', async () => {
    const repoA = new TenantRepository({ organizationId: orgA.id });
    const brandB = await repoA.findManyBrands({ where: { name: 'Brand B' } });
    expect(brandB).toHaveLength(0);
  });

  it('Org A brand listing never returns Org B data', async () => {
    const repoA = new TenantRepository({ organizationId: orgA.id });
    const brands = await repoA.findManyBrands();
    const hasBrandB = brands.some(b => b.name === 'Brand B');
    expect(hasBrandB).toBe(false);
  });

  it('missing organizationId fails before an unscoped query', async () => {
    // @ts-expect-error - Intentionally failing type check
    expect(() => new TenantRepository({ organizationId: undefined })).toThrow();
  });
});
