import { NextResponse } from 'next/server';
import { prisma } from '@abge/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createPlatformSession } from '@abge/auth';
import { decryptTotpSecret, verifyTotpToken } from '@abge/auth';
import { generate } from 'otplib';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  totpCode: z.string().length(6),
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

    // Verify TOTP
    if (!admin.totpSecret) {
      // In a real system, you might redirect them to a setup flow if not set up, 
      // but for MVP, we assume the initial platform admin has it provisioned via seed script
      return NextResponse.json(
        { error: 'TOTP not configured for this account.' },
        { status: 403 }
      );
    }

    let isTotpValid = false;
    try {
      const secret = decryptTotpSecret(admin.totpSecret);
      isTotpValid = await verifyTotpToken(data.totpCode, secret);
      
      const expectedCode = await generate({ secret });
      console.log('--- TOTP Verification ---');
      console.log('Received Code:', data.totpCode);
      console.log('Expected Code (server time):', expectedCode);
      console.log('Decrypted Secret:', secret);
      console.log('Is TOTP Valid:', isTotpValid);
      console.log('------------------------');
    } catch (e) {
      console.error('TOTP verification error', e);
    }

    if (!isTotpValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code.' },
        { status: 401 }
      );
    }

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
