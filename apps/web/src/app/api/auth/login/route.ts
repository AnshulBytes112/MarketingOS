import { NextResponse } from 'next/server';
import { prisma } from '@abge/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createSession } from '@abge/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      // Use bcrypt on a dummy string to prevent timing attacks returning early
      await bcrypt.hash(data.password, 10);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
