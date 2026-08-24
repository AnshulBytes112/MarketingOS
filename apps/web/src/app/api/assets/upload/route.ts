import { NextResponse } from 'next/server';
import { requirePermission } from '@abge/auth';
import { TenantRepository } from '@abge/tenant';
import { s3 } from '@/lib/s3';
import { logger } from '@/lib/logger';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const requestId = request.headers.get('x-request-id') || randomUUID();
  
  try {
    const session = await requirePermission('manage_brand_dna');
    
    logger.setContext({
      requestId,
      userId: session.userId,
      organizationId: session.organizationId,
    });

    const body = await request.json();
    let { brandId, filename, contentType, replaceAssetId, fileSize } = body;
    if (!contentType) {
      contentType = 'application/octet-stream';
    }

    if (!brandId || !filename) {
      logger.warn('Missing required fields for upload', { brandId, filename, contentType });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tenantRepo = new TenantRepository({ organizationId: session.organizationId });

    // Validate that the brand belongs to the active organization
    const brand = await tenantRepo.findUniqueBrand({
      where: { id: brandId },
    });

    if (!brand) {
      logger.warn('Brand not found or does not belong to organization', { brandId });
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const assetId = randomUUID();
    // Enforce tenant isolation in the object key
    const objectKey = `organization/${session.organizationId}/brands/${brandId}/assets/${assetId}`;

    logger.info('Generating signed upload URL', { objectKey, assetId });

    const signedUrl = await s3.generateSignedUploadUrl(objectKey, contentType);

    let asset;
    if (replaceAssetId) {
      // Handle replace
      asset = await tenantRepo.findUniqueBrandAsset({ where: { id: replaceAssetId } });
      if (asset) {
        if (asset.url) {
          try {
            await s3.deleteObject(asset.url);
          } catch (err) {
            logger.warn('Failed to delete old S3 object during replacement', { url: asset.url });
          }
        }
        asset = await tenantRepo.updateBrandAsset({
          where: { id: replaceAssetId },
          data: {
            url: objectKey,
            type: contentType,
            fileName: filename,
            mimeType: contentType,
            size: fileSize || null,
            extractionStatus: 'PENDING',
            extractedText: null,
            metadata: { filename },
          }
        });
      } else {
        return NextResponse.json({ error: 'Asset to replace not found' }, { status: 404 });
      }
    } else {
      // Save initial metadata in the database
      asset = await tenantRepo.createBrandAsset({
        data: {
          id: assetId,
          brand: { connect: { id: brandId } },
          type: contentType,
          url: objectKey,
          fileName: filename,
          mimeType: contentType,
          size: fileSize || null,
          extractionStatus: 'PENDING',
          metadata: { filename },
        },
      });
    }

    logger.info('Successfully generated signed URL and created BrandAsset', { assetId });

    return NextResponse.json({
      uploadUrl: signedUrl,
      asset,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
        logger.warn('Unauthorized upload attempt', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      
      logger.error('Failed to generate signed upload URL', { error: error.message, stack: error.stack });
    } else {
      logger.error('Failed to generate signed upload URL with unknown error', { error });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
