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

  async updateBrandAsset(args: Omit<Prisma.BrandAssetUpdateArgs, 'where'> & { where: Omit<Prisma.BrandAssetWhereUniqueInput, 'organizationId'> }): Promise<BrandAsset> {
    return prisma.brandAsset.update({
      ...args,
      where: {
        ...args.where,
        organizationId: this.organizationId,
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

  // --- BRAND DNA OPERATIONS ---

  async getActiveBrandDna(brandId: string) {
    return prisma.brandDNAVersion.findFirst({
      where: {
        brandId,
        organizationId: this.organizationId,
        publicationStatus: 'ACTIVE',
      },
    });
  }

  async publishBrandDnaVersion(brandId: string, versionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify the version belongs to this org and brand, and is COMPLETED or DRAFT
      const version = await tx.brandDNAVersion.findFirst({
        where: {
          id: versionId,
          brandId,
          organizationId: this.organizationId,
        },
      });

      if (!version) {
        throw new Error('Version not found or unauthorized');
      }

      if (version.status !== 'COMPLETED') {
        throw new Error('Only COMPLETED versions can be published');
      }

      // 2. Mark any currently ACTIVE version as SUPERSEDED
      await tx.brandDNAVersion.updateMany({
        where: {
          brandId,
          organizationId: this.organizationId,
          publicationStatus: 'ACTIVE',
        },
        data: {
          publicationStatus: 'SUPERSEDED',
        },
      });

      // 3. Mark the target version as ACTIVE
      const updated = await tx.brandDNAVersion.update({
        where: { id: versionId },
        data: {
          publicationStatus: 'ACTIVE',
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: this.organizationId,
          userId,
          action: 'BRAND_DNA_VERSION_PUBLISHED',
          entityType: 'BrandDNAVersion',
          entityId: versionId,
          metadata: {
            brandId,
            version: updated.version,
          },
        },
      });

      return updated;
    });
  }

  async restoreBrandDnaVersion(brandId: string, versionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch the source version
      const sourceVersion = await tx.brandDNAVersion.findFirst({
        where: {
          id: versionId,
          brandId,
          organizationId: this.organizationId,
        },
      });

      if (!sourceVersion) {
        throw new Error('Source version not found or unauthorized');
      }

      // 2. Get the next version number
      const highestVersion = await tx.brandDNAVersion.findFirst({
        where: { brandId, organizationId: this.organizationId },
        orderBy: { version: 'desc' },
      });
      const nextVersionNum = (highestVersion?.version || 0) + 1;

      // 3. Mark current ACTIVE as SUPERSEDED
      await tx.brandDNAVersion.updateMany({
        where: {
          brandId,
          organizationId: this.organizationId,
          publicationStatus: 'ACTIVE',
        },
        data: {
          publicationStatus: 'SUPERSEDED',
        },
      });

      // 4. Create NEW version by copying source
      const newVersion = await tx.brandDNAVersion.create({
        data: {
          organizationId: this.organizationId,
          brandId,
          version: nextVersionNum,
          status: 'COMPLETED',
          publicationStatus: 'ACTIVE',
          source: 'RESTORED',
          restoredFromVersionId: sourceVersion.id,
          personality: sourceVersion.personality,
          voice: sourceVersion.voice,
          tone: sourceVersion.tone,
          positioning: sourceVersion.positioning,
          visualIdentitySummary: sourceVersion.visualIdentitySummary,
          audience: sourceVersion.audience,
          contentPillars: sourceVersion.contentPillars ?? undefined,
          language: sourceVersion.language,
          ctaPreferences: sourceVersion.ctaPreferences,
          avoidList: sourceVersion.avoidList ?? undefined,
          claims: sourceVersion.claims ?? undefined,
          constraints: sourceVersion.constraints ?? undefined,
          confidenceScore: sourceVersion.confidenceScore,
          sources: sourceVersion.sources ?? undefined,
          createdById: userId,
          completedAt: new Date(),
        },
      });

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          organizationId: this.organizationId,
          userId,
          action: 'BRAND_DNA_VERSION_RESTORED',
          entityType: 'BrandDNAVersion',
          entityId: newVersion.id,
          metadata: {
            brandId,
            restoredFromVersionId: sourceVersion.id,
            newlyCreatedVersionId: newVersion.id,
          },
        },
      });

      return newVersion;
    });
  }
}
