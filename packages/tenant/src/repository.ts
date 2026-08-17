import { prisma } from '@abge/database';
import type { Prisma, Brand, OrganizationMember, AuditLog, BrandAsset, BrandProduct, BrandCompetitor } from '@prisma/client';

export type OrganizationContext = {
  organizationId: string;
};

/**
 * TenantRepository is the Central Tenant Guard.
 * All access to organization-scoped tables MUST go through this class.
 * It enforces that the `organizationId` is always passed and applied to all queries.
 */
export class TenantRepository {
  private organizationId: string;

  constructor(context: OrganizationContext) {
    if (!context.organizationId) {
      throw new Error('OrganizationContext must include a valid organizationId');
    }
    this.organizationId = context.organizationId;
  }

  // --- BRAND OPERATIONS ---

  async findManyBrands(args?: Omit<Prisma.BrandFindManyArgs, 'where'> & { where?: Omit<Prisma.BrandWhereInput, 'organizationId'> }): Promise<Brand[]> {
    return prisma.brand.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async findUniqueBrand(args: Omit<Prisma.BrandFindUniqueArgs, 'where'> & { where: Omit<Prisma.BrandWhereUniqueInput, 'organizationId'> }): Promise<Brand | null> {
    return prisma.brand.findFirst({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createBrand(args: Omit<Prisma.BrandCreateArgs, 'data'> & { data: Omit<Prisma.BrandCreateInput, 'organization'> }): Promise<Brand> {
    return prisma.brand.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  async updateBrand(args: Omit<Prisma.BrandUpdateArgs, 'where'> & { where: Omit<Prisma.BrandWhereUniqueInput, 'organizationId'> }): Promise<Brand> {
    return prisma.brand.update({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  // --- BRAND PRODUCT OPERATIONS ---

  async findManyBrandProducts(args?: Omit<Prisma.BrandProductFindManyArgs, 'where'> & { where?: Omit<Prisma.BrandProductWhereInput, 'organizationId'> }): Promise<BrandProduct[]> {
    return prisma.brandProduct.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createBrandProduct(args: Omit<Prisma.BrandProductCreateArgs, 'data'> & { data: Omit<Prisma.BrandProductCreateInput, 'organization'> }): Promise<BrandProduct> {
    return prisma.brandProduct.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  async updateBrandProduct(args: Omit<Prisma.BrandProductUpdateArgs, 'where'> & { where: Omit<Prisma.BrandProductWhereUniqueInput, 'organizationId'> }): Promise<BrandProduct> {
    return prisma.brandProduct.update({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  async deleteBrandProduct(args: Omit<Prisma.BrandProductDeleteArgs, 'where'> & { where: Omit<Prisma.BrandProductWhereUniqueInput, 'organizationId'> }): Promise<BrandProduct> {
    return prisma.brandProduct.delete({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  // --- BRAND COMPETITOR OPERATIONS ---

  async findManyBrandCompetitors(args?: Omit<Prisma.BrandCompetitorFindManyArgs, 'where'> & { where?: Omit<Prisma.BrandCompetitorWhereInput, 'organizationId'> }): Promise<BrandCompetitor[]> {
    return prisma.brandCompetitor.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createBrandCompetitor(args: Omit<Prisma.BrandCompetitorCreateArgs, 'data'> & { data: Omit<Prisma.BrandCompetitorCreateInput, 'organization'> }): Promise<BrandCompetitor> {
    return prisma.brandCompetitor.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  async updateBrandCompetitor(args: Omit<Prisma.BrandCompetitorUpdateArgs, 'where'> & { where: Omit<Prisma.BrandCompetitorWhereUniqueInput, 'organizationId'> }): Promise<BrandCompetitor> {
    return prisma.brandCompetitor.update({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  async deleteBrandCompetitor(args: Omit<Prisma.BrandCompetitorDeleteArgs, 'where'> & { where: Omit<Prisma.BrandCompetitorWhereUniqueInput, 'organizationId'> }): Promise<BrandCompetitor> {
    return prisma.brandCompetitor.delete({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }


  // --- ORGANIZATION MEMBER OPERATIONS ---

  async findManyMembers(args?: Omit<Prisma.OrganizationMemberFindManyArgs, 'where'> & { where?: Omit<Prisma.OrganizationMemberWhereInput, 'organizationId'> }): Promise<OrganizationMember[]> {
    return prisma.organizationMember.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createMember(args: Omit<Prisma.OrganizationMemberCreateArgs, 'data'> & { data: Omit<Prisma.OrganizationMemberCreateInput, 'organization'> }): Promise<OrganizationMember> {
    return prisma.organizationMember.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  // --- AUDIT LOG OPERATIONS ---

  async findManyAuditLogs(args?: Omit<Prisma.AuditLogFindManyArgs, 'where'> & { where?: Omit<Prisma.AuditLogWhereInput, 'organizationId'> }): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createAuditLog(args: Omit<Prisma.AuditLogCreateArgs, 'data'> & { data: Omit<Prisma.AuditLogCreateInput, 'organization'> }): Promise<AuditLog> {
    return prisma.auditLog.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  // --- BRAND ASSET OPERATIONS ---

  async findManyBrandAssets(args?: Omit<Prisma.BrandAssetFindManyArgs, 'where'> & { where?: Omit<Prisma.BrandAssetWhereInput, 'organizationId'> }): Promise<BrandAsset[]> {
    return prisma.brandAsset.findMany({
      ...args,
      where: {
        ...args?.where,
        organizationId: this.organizationId,
      },
    });
  }

  async findUniqueBrandAsset(args: Omit<Prisma.BrandAssetFindUniqueArgs, 'where'> & { where: Omit<Prisma.BrandAssetWhereUniqueInput, 'organizationId'> }): Promise<BrandAsset | null> {
    return prisma.brandAsset.findFirst({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }

  async createBrandAsset(args: Omit<Prisma.BrandAssetCreateArgs, 'data'> & { data: Omit<Prisma.BrandAssetCreateInput, 'organization'> }): Promise<BrandAsset> {
    return prisma.brandAsset.create({
      ...args,
      data: {
        ...args.data,
        organization: {
          connect: { id: this.organizationId },
        },
      },
    });
  }

  async deleteBrandAsset(args: Omit<Prisma.BrandAssetDeleteArgs, 'where'> & { where: Omit<Prisma.BrandAssetWhereUniqueInput, 'organizationId'> }): Promise<BrandAsset> {
    return prisma.brandAsset.delete({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
      },
    });
  }
}
