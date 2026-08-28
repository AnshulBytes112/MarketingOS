"use server";

import { requireAuth } from "@abge/auth";
import { prisma } from "@abge/database";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAvailableOrganizations() {
  const session = await requireAuth();

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.userId, status: "ACTIVE" },
    include: { organization: true },
    orderBy: { organization: { name: "asc" } },
  });

  return memberships.map(m => ({
    id: m.organization.id,
    name: m.organization.name,
    role: m.role,
    isCurrent: m.organization.id === session.organizationId,
  }));
}

export async function switchOrganization(targetOrganizationId: string) {
  const session = await requireAuth();
  
  if (session.organizationId === targetOrganizationId) {
    return; // already active
  }

  // Verify the user actually has an active membership in the target organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: targetOrganizationId,
        userId: session.userId,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw new Error("You do not have access to this organization.");
  }

  // In Next.js, updating the current session token's active organization:
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('abge_session')?.value;

  if (!sessionToken) {
    throw new Error("No active session found.");
  }

  await prisma.session.update({
    where: { sessionToken },
    data: { activeOrganizationId: targetOrganizationId },
  });

  revalidatePath("/", "layout");
}
