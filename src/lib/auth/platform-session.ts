import { cookies } from 'next/headers';
import { prisma } from '../db/index';
import crypto from 'crypto';

const PLATFORM_SESSION_COOKIE_NAME = 'abge_platform_session';
const PLATFORM_SESSION_EXPIRATION_DAYS = 1; // Shorter session for platform admin

export async function createPlatformSession(platformAdminId: string, ipAddress?: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PLATFORM_SESSION_EXPIRATION_DAYS);

  const session = await prisma.platformSession.create({
    data: {
      sessionToken,
      platformAdminId,
      expiresAt,
      ipAddress,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(PLATFORM_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return session;
}

export async function invalidatePlatformSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(PLATFORM_SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.platformSession.deleteMany({
      where: { sessionToken },
    });
    cookieStore.delete(PLATFORM_SESSION_COOKIE_NAME);
  }
}

export async function getPlatformSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(PLATFORM_SESSION_COOKIE_NAME)?.value;
}
