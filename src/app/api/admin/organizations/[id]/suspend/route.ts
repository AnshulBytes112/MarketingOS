import { NextResponse } from 'next/server';
import { requirePlatformAuth } from '@/lib/auth/platform-guard';
import { prisma } from '@/lib/db/index';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requirePlatformAuth();

    await prisma.organization.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });

    await prisma.platformAuditLog.create({
      data: {
        platformAdminId: session.platformAdminId,
        action: 'SUSPEND_ORGANIZATION',
        entityType: 'Organization',
        entityId: id,
      }
    });

    // In a real app we might redirect back or return json. Since the form action in the UI does a POST, we'll redirect.
    return NextResponse.redirect(new URL(`/admin/organizations/${id}`, request.url), 303);
  } catch (error) {
    console.error('Suspend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
