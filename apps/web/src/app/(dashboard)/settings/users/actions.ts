"use server";

import { requireAuth, requirePermission } from "@abge/auth";
import { prisma } from "@abge/database";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const session = await requireAuth();

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: session.organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return members.map((m) => ({
    id: m.userId,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    status: m.status,
    joinedAt: m.createdAt,
  }));
}

export async function inviteUser(email: string, name: string, role: Role) {
  const session = await requirePermission("user.create");

  // Verify not trying to create a duplicate user account
  let targetUser = await prisma.user.findUnique({ where: { email } });

  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email,
        name,
        // Using a placeholder or letting standard auth handle password later.
      },
    });
  }

  // Check if they are already in the organization
  const existingMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: targetUser.id,
      },
    },
  });

  if (existingMembership) {
    throw new Error("User is already a member of this organization.");
  }

  const membership = await prisma.organizationMember.create({
    data: {
      organizationId: session.organizationId,
      userId: targetUser.id,
      role,
      status: "ACTIVE",
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_INVITED",
      entityType: "OrganizationMember",
      entityId: membership.id,
      metadata: { targetUserId: targetUser.id, role },
    },
  });

  revalidatePath("/settings/users");
  return membership;
}

// Ensure last active OWNER protection
async function verifyNotLastActiveOwner(organizationId: string, targetUserId: string) {
  const ownerCount = await prisma.organizationMember.count({
    where: {
      organizationId,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  // If this target user is currently an active OWNER, and they are the ONLY ONE left, fail.
  if (ownerCount <= 1) {
    const targetMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId, userId: targetUserId }
      }
    });

    if (targetMember && targetMember.role === "OWNER" && targetMember.status === "ACTIVE") {
      throw new Error("Cannot demote or deactivate the last active OWNER of the organization.");
    }
  }
}

export async function changeRole(targetUserId: string, newRole: Role) {
  const session = await requirePermission("user.edit_role");

  await verifyNotLastActiveOwner(session.organizationId, targetUserId);

  const membership = await prisma.organizationMember.update({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: targetUserId,
      },
    },
    data: { role: newRole },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_ROLE_CHANGED",
      entityType: "OrganizationMember",
      entityId: membership.id,
      metadata: { targetUserId, newRole },
    },
  });

  revalidatePath("/settings/users");
  return membership;
}

export async function deactivateUser(targetUserId: string) {
  const session = await requirePermission("user.deactivate");

  if (targetUserId === session.userId) {
    throw new Error("You cannot deactivate yourself.");
  }

  await verifyNotLastActiveOwner(session.organizationId, targetUserId);

  const membership = await prisma.organizationMember.update({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: targetUserId,
      },
    },
    data: { status: "DEACTIVATED" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_DEACTIVATED",
      entityType: "OrganizationMember",
      entityId: membership.id,
      metadata: { targetUserId },
    },
  });

  revalidatePath("/settings/users");
  return membership;
}

export async function reactivateUser(targetUserId: string) {
  const session = await requirePermission("user.reactivate");

  const membership = await prisma.organizationMember.update({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: targetUserId,
      },
    },
    data: { status: "ACTIVE" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_REACTIVATED",
      entityType: "OrganizationMember",
      entityId: membership.id,
      metadata: { targetUserId },
    },
  });

  revalidatePath("/settings/users");
  return membership;
}
