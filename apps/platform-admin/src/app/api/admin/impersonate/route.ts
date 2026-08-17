import { NextResponse } from 'next/server';
import { requirePlatformAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const targetUserId = formData.get('targetUserId') as string;
    const targetOrganizationId = formData.get('targetOrganizationId') as string;
    
    if (!targetUserId || !targetOrganizationId) {
      return NextResponse.json({ error: 'Missing target parameters' }, { status: 400 });
    }

    const session = await requirePlatformAuth();

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins max

    await prisma.impersonationSession.create({
      data: {
        platformAdminId: session.platformAdminId,
        targetUserId,
        targetOrganizationId,
        sessionToken,
        readOnly: true, // as required by PRD
        expiresAt
      }
    });

    await prisma.platformAuditLog.create({
      data: {
        platformAdminId: session.platformAdminId,
        action: 'START_IMPERSONATION',
        entityType: 'User',
        entityId: targetUserId,
        metadata: { organizationId: targetOrganizationId }
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('abge_impersonation_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.redirect(new URL(`/overview`, request.url), 303);
  } catch (error) {
    console.error('Impersonate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
