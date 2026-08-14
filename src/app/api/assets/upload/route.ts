import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';
import { TenantRepository } from '@/lib/db/repository';
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
    const { brandId, filename, contentType } = body;

    if (!brandId || !filename || !contentType) {
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

    // Save initial metadata in the database
    const asset = await tenantRepo.createBrandAsset({
      data: {
        id: assetId,
        brand: { connect: { id: brandId } },
        type: contentType,
        url: objectKey, // Storing the key, can be resolved to full URL later
        metadata: { filename },
      },
    });

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
