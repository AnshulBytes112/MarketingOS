import { NextResponse } from 'next/server';
import { prisma } from '@abge/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createPlatformSession } from '@abge/auth';
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const admin = await prisma.platformAdmin.findUnique({
      where: { email: data.email },
    });

    if (!admin || !admin.passwordHash) {
      await bcrypt.hash(data.password, 10); // mitigate timing attacks
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // TOTP Verification completely removed

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr') || undefined;
    await createPlatformSession(admin.id, ipAddress);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Platform admin login error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
