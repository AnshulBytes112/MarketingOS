import { NextResponse } from 'next/server';
import { prisma } from '@abge/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createSession } from '@abge/auth';
import { Role } from '@prisma/client';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // Generic error to prevent account enumeration
      return NextResponse.json(
        { error: 'An error occurred during registration. Please try again or log in.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const orgSlug = data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: orgSlug,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: Role.OWNER,
        },
      });

      return { user, org };
    });

    await createSession(result.user.id, result.org.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
