import { NextResponse } from 'next/server';
import { requirePlatformAuth } from '@abge/auth';
import { setFeatureFlag } from '@/lib/feature-flags';
import { prisma } from '@abge/database';
import { z } from 'zod';

const flagSchema = z.object({
  organizationId: z.string(),
  flagName: z.string(),
  enabled: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const session = await requirePlatformAuth();
    
    const body = await request.json();
    const data = flagSchema.parse(body);

    await setFeatureFlag(data.organizationId, data.flagName, data.enabled);

    await prisma.platformAuditLog.create({
      data: {
        platformAdminId: session.platformAdminId,
        action: data.enabled ? 'ENABLE_FEATURE_FLAG' : 'DISABLE_FEATURE_FLAG',
        entityType: 'Organization',
        entityId: data.organizationId,
        metadata: { flagName: data.flagName }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set feature flag error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
