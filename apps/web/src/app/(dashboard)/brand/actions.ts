'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TenantRepository } from '@abge/tenant';
import { requireAuth, requirePermission } from '@abge/auth';
import { getBrandAssetQueue, enqueueBrandDnaGeneration } from '@/lib/queue';
import { s3 } from '@/lib/s3';
import { prisma } from '@abge/database';

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  type: z.string().optional(),
});

export async function getAssets(brandId: string, page: number = 1, pageSize: number = 10, type?: string) {
  const session = await requireAuth();
  const repo = new TenantRepository(session);
  
  const skip = (page - 1) * pageSize;
  const where = {
    brandId,
    ...(type && { type }),
  };

  // We rely on TenantRepository to scope this to the current organization
  const [assets, totalCount] = await Promise.all([
    repo.findManyBrandAssets({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    // Need a count method or just findMany to get length (if count is missing in TenantRepository)
    repo.findManyBrandAssets({ where }).then(res => res?.length || 0)
  ]);

  return {
    assets,
    metadata: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  };
}

export async function deleteAssetAction(assetId: string) {
  const session = await requirePermission('brand.edit');
  const repo = new TenantRepository(session);

  const asset = await repo.findUniqueBrandAsset({ where: { id: assetId } });
  if (!asset) throw new Error('Asset not found or access denied');

  // Delete from S3
  try {
    await s3.deleteObject(asset.url);
  } catch (error) {
    console.error('Failed to delete S3 object', error);
    // Even if S3 fails (maybe already deleted), we still want to remove from DB
  }

  await repo.deleteBrandAsset({ where: { id: assetId } });
  revalidatePath('/brand');
  return { success: true };
}

export async function getAssetPreviewUrl(assetId: string) {
  const session = await requireAuth();
  const repo = new TenantRepository(session);

  const asset = await repo.findUniqueBrandAsset({ where: { id: assetId } });
  if (!asset) throw new Error('Asset not found');

  const signedUrl = await s3.generateSignedDownloadUrl(asset.url);
  return { url: signedUrl };
}

export async function enqueueAssetExtraction(assetId: string, brandId: string) {
  const session = await requirePermission('brand.edit');
  
  await getBrandAssetQueue().add('brand-asset.extract-text', {
    organizationId: session.organizationId,
    brandId,
    assetId
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
}

export async function getBrandDna(brandId: string) {
  const session = await requireAuth();

  // First check if there is a version currently generating for this brand
  const generatingVersion = await prisma.brandDNAVersion.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      status: 'GENERATING'
    }
  });

  if (generatingVersion) {
    return generatingVersion;
  }
  
  const repo = new TenantRepository(session);
  return repo.getActiveBrandDna(brandId);
}

export async function getBrandDnaVersions(brandId: string) {
  const session = await requireAuth();
  
  // Using Prisma directly here to include edits, but scoped correctly
  const versions = await prisma.brandDNAVersion.findMany({
    where: { 
      brandId, 
      organizationId: session.organizationId 
    },
    orderBy: { version: 'desc' },
    include: {
      edits: true
    }
  });

  return versions;
}

export async function regenerateBrandDna(brandId: string) {
  const session = await requirePermission('brand.edit');

  // Verify ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId }
  });

  if (!brand) throw new Error('Brand not found');

  // Check if there is already a version currently generating
  const generating = await prisma.brandDNAVersion.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      status: 'GENERATING'
    }
  });

  if (!generating) {
    // Calculate next version number
    const highestVersion = await prisma.brandDNAVersion.findFirst({
      where: { brandId, organizationId: session.organizationId },
      orderBy: { version: 'desc' },
    });
    const nextVersionNum = (highestVersion?.version || 0) + 1;

    // Create the GENERATING version record immediately
    await prisma.brandDNAVersion.create({
      data: {
        organizationId: session.organizationId,
        brandId,
        version: nextVersionNum,
        status: 'GENERATING',
        confidenceScore: 0,
        sources: [],
        createdById: session.userId,
      }
    });
  }

  await enqueueBrandDnaGeneration(session.organizationId, brandId, session.userId);
  revalidatePath('/brand');
  return { success: true };
}

const updateBrandDnaFieldSchema = z.object({
  versionId: z.string().cuid(),
  brandId: z.string().cuid(),
  field: z.enum([
    'personality', 'voice', 'tone', 'positioning', 'visualIdentitySummary', 
    'audience', 'contentPillars', 'language', 'ctaPreferences', 
    'avoidList', 'claims', 'constraints'
  ]),
  value: z.any() // Type-specific validation happens below
});

export async function updateBrandDnaField(payload: z.infer<typeof updateBrandDnaFieldSchema>) {
  const session = await requirePermission('brand.edit');
  
  // Validate basic payload
  const { versionId, brandId, field, value } = updateBrandDnaFieldSchema.parse(payload);
  
  // Validate value type based on field
  if (['contentPillars', 'avoidList', 'claims', 'constraints'].includes(field)) {
    if (!Array.isArray(value)) throw new Error(`Field ${field} must be an array`);
  } else {
    if (typeof value !== 'string') throw new Error(`Field ${field} must be a string`);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Verify ownership
    const version = await tx.brandDNAVersion.findFirst({
      where: { 
        id: versionId, 
        brandId, 
        organizationId: session.organizationId 
      }
    });

    if (!version) {
      console.log('debug findFirst version null', {
        versionId,
        brandId,
        sessionOrgId: session.organizationId,
        sessionUserId: session.userId,
      });
      throw new Error('Version not found or unauthorized');
    }

    // 2. Check if we need to duplicate
    let targetVersionId = versionId;
    
    if (version.source === 'AI_GENERATION' || version.source === 'RESTORED') {
      // Duplicate version
      const highestVersion = await tx.brandDNAVersion.findFirst({
        where: { brandId, organizationId: session.organizationId },
        orderBy: { version: 'desc' },
      });
      const nextVersionNum = (highestVersion?.version || 0) + 1;

      const newVersion = await tx.brandDNAVersion.create({
        data: {
          organizationId: session.organizationId,
          brandId,
          version: nextVersionNum,
          status: 'COMPLETED',
          publicationStatus: version.publicationStatus,
          source: 'MANUAL_EDIT',
          restoredFromVersionId: version.id,
          personality: version.personality,
          voice: version.voice,
          tone: version.tone,
          positioning: version.positioning,
          visualIdentitySummary: version.visualIdentitySummary,
          audience: version.audience,
          contentPillars: version.contentPillars ?? undefined,
          language: version.language,
          ctaPreferences: version.ctaPreferences,
          avoidList: version.avoidList ?? undefined,
          claims: version.claims ?? undefined,
          constraints: version.constraints ?? undefined,
          confidenceScore: version.confidenceScore,
          sources: version.sources ?? undefined,
          createdById: session.userId,
          completedAt: new Date(),
        },
      });
      
      targetVersionId = newVersion.id;

      // If the original was ACTIVE, we must supersede the old one explicitly
      if (version.publicationStatus === 'ACTIVE') {
        await tx.brandDNAVersion.update({
          where: { id: versionId },
          data: { publicationStatus: 'SUPERSEDED' }
        });
      }
    }

    // 3. Get previous value (from the original version we are editing)
    const previousValue = version[field as keyof typeof version];
    const previousValueStr = previousValue !== null && previousValue !== undefined 
      ? (typeof previousValue === 'object' ? JSON.stringify(previousValue) : String(previousValue))
      : null;
    
    const newValueStr = value !== null && value !== undefined 
      ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
      : null;

    // 4. Update the target version in place
    await tx.brandDNAVersion.update({
      where: { id: targetVersionId },
      data: {
        [field]: value
      }
    });

    // 5. Create edit history record against the target version
    await tx.brandDNAEdit.create({
      data: {
        organizationId: session.organizationId,
        brandId,
        brandDNAVersionId: targetVersionId,
        userId: session.userId,
        field,
        previousValue: previousValueStr,
        newValue: newValueStr,
        source: 'MANUAL_EDIT'
      }
    });

    // 6. Create audit log
    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'BRAND_DNA_FIELD_UPDATED',
        entityType: 'BrandDNAVersion',
        entityId: targetVersionId,
        metadata: {
          field,
          source: 'MANUAL_EDIT',
          previousValue: previousValueStr,
          newValue: newValueStr,
          originalVersionId: versionId !== targetVersionId ? versionId : undefined
        }
      }
    });

    return { success: true, targetVersionId };
  });
}

export async function publishBrandDnaVersionAction(brandId: string, versionId: string) {
  const session = await requirePermission('brand.edit');
  const repo = new TenantRepository(session);
  await repo.publishBrandDnaVersion(brandId, versionId, session.userId);
  revalidatePath('/brand');
  return { success: true };
}

export async function restoreBrandDnaVersionAction(brandId: string, versionId: string) {
  const session = await requirePermission('brand.edit');
  const repo = new TenantRepository(session);
  await repo.restoreBrandDnaVersion(brandId, versionId, session.userId);
  revalidatePath('/brand');
  return { success: true };
}
