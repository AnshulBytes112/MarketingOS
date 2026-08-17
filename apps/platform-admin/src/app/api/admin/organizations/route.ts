import { NextResponse } from 'next/server';
import { requirePlatformAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import bcrypt from 'bcryptjs';
import { PlanTier } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await requirePlatformAuth();

    const body = await request.json();
    const { name, slug: rawSlug, planTier, ownerName, ownerEmail, ownerPassword } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: 'Organization name and owner email are required.' },
        { status: 400 }
      );
    }

    const slug = (rawSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    // Check slug uniqueness
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: `Organization with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    // Check user email uniqueness or find user
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    const passwordHash = await bcrypt.hash(ownerPassword || 'password123', 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name,
          slug,
          planTier: (planTier as PlanTier) || PlanTier.STARTER,
        },
      });

      // 2. Create or reuse User
      let user = existingUser;
      if (!user) {
        user = await tx.user.create({
          data: {
            email: ownerEmail,
            name: ownerName || name + ' Owner',
            passwordHash,
          },
        });
      }

      // 3. Connect User as OWNER of Organization
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // 4. Audit Log
      await tx.platformAuditLog.create({
        data: {
          platformAdminId: session.platformAdminId,
          action: 'CREATE_ORGANIZATION',
          entityType: 'Organization',
          entityId: org.id,
          metadata: {
            slug: org.slug,
            ownerEmail,
            planTier: org.planTier,
          },
        },
      });

      return org;
    });

    return NextResponse.json({ success: true, organization: result }, { status: 201 });
  } catch (error) {
    console.error('Create organization error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
