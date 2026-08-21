'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TenantRepository } from '@abge/tenant';
import { requireAuth, requirePermission } from '@abge/auth';
import { brandAssetQueue, enqueueBrandDnaGeneration } from '@/lib/queue';
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
    repo.findManyBrandAssets({ where }).then(res => res.length)
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
  const session = await requirePermission('manage_brand_dna');
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
  const session = await requirePermission('manage_brand_dna');
  
  await brandAssetQueue.add('brand-asset.extract-text', {
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
  
  // Since TenantRepository might not have findUniqueBrandDNAVersion yet, use Prisma directly safely:
  const version = await prisma.brandDNAVersion.findFirst({
    where: { 
      brandId, 
      organizationId: session.organizationId 
    },
    orderBy: { version: 'desc' },
  });

  return version;
}

export async function regenerateBrandDna(brandId: string) {
  const session = await requirePermission('manage_brand_dna');

  // Verify ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId }
  });

  if (!brand) throw new Error('Brand not found');

  await enqueueBrandDnaGeneration(session.organizationId, brandId);
  revalidatePath('/brand');
  return { success: true };
}
