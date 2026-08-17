import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@abge/database';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('abge_impersonation_session')?.value;

    if (sessionToken) {
      const session = await prisma.impersonationSession.findUnique({
        where: { sessionToken }
      });

      if (session) {
        await prisma.impersonationSession.update({
          where: { sessionToken },
          data: { endedAt: new Date() }
        });

        await prisma.platformAuditLog.create({
          data: {
            platformAdminId: session.platformAdminId,
            action: 'STOP_IMPERSONATION',
            entityType: 'User',
            entityId: session.targetUserId,
          }
        });
      }

      cookieStore.delete('abge_impersonation_session');
    }

    // Redirect to the platform dashboard after stopping
    return NextResponse.redirect(new URL(`/admin/dashboard`, request.url), 303);
  } catch (error) {
    console.error('Stop impersonate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
