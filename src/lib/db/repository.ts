import { prisma } from './index';
import type { Prisma, Brand, OrganizationMember, AuditLog } from '@prisma/client';

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
}
