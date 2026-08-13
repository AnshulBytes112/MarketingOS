import { cookies } from 'next/headers';
import { prisma } from '../db/index';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'abge_session';
const SESSION_EXPIRATION_DAYS = 30;

export async function createSession(userId: string, activeOrganizationId?: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRATION_DAYS);

  // If no activeOrganizationId is provided, try to find the user's first organization
  let orgId = activeOrganizationId;
  if (!orgId) {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
    });
    orgId = membership?.organizationId;
  }

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      activeOrganizationId: orgId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return session;
}

export async function invalidateSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function updateSessionOrganization(organizationId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const session = await prisma.session.findUnique({ where: { sessionToken } });
    if (!session) return;

    // Verify user is actually a member of the requested organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organizationId,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      throw new Error('Unauthorized organization switch');
    }

    await prisma.session.update({
      where: { sessionToken },
      data: { activeOrganizationId: organizationId },
    });
  }
}
