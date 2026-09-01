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
    customPermissions: m.customPermissions,
    joinedAt: m.createdAt,
  }));
}

export async function inviteUser(email: string, name: string, role: Role) {
  const session = await requirePermission("user.create");

  let targetUser = await prisma.user.findUnique({ where: { email } });
  
  let temporaryPassword = null;
  const org = await prisma.organization.findUnique({ where: { id: session.organizationId }});

  if (!targetUser) {
    const crypto = await import("crypto");
    const bcrypt = await import("bcryptjs");
    temporaryPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    targetUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        mustChangePassword: true,
      },
    });
  }

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
  return { 
    membership, 
    temporaryPassword,
    organizationName: org?.name || "Organization"
  };
}

export async function updateUserPermissions(targetUserId: string, customPermissions: { grant: string[], deny: string[] } | null) {
  const session = await requirePermission("user.edit_permissions");

  // Validate custom permissions against the registry
  if (customPermissions) {
    const { PERMISSION_REGISTRY } = await import("@abge/rbac");
    const allRequested = [...(customPermissions.grant || []), ...(customPermissions.deny || [])];
    for (const p of allRequested) {
      if (!PERMISSION_REGISTRY[p as keyof typeof PERMISSION_REGISTRY]) {
        throw new Error(`Invalid permission provided: ${p}`);
      }
      
      // Admin must possess the permission they are trying to grant (unless OWNER)
      if (customPermissions.grant?.includes(p) && session.role !== "OWNER") {
        if (!session.effectivePermissions.includes(p)) {
          throw new Error(`Cannot grant permission you do not possess: ${p}`);
        }
      }
    }
  }

  // Ensure target user is in the organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: targetUserId,
      },
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this organization.");
  }

  // Last owner protection
  if (membership.role === "OWNER" && membership.status === "ACTIVE") {
    // We shouldn't mess with OWNER permissions, they are unrestricted anyway
    throw new Error("Cannot modify custom permissions for an OWNER.");
  }

  const updatedMembership = await prisma.organizationMember.update({
    where: { id: membership.id },
    data: {
      customPermissions: customPermissions ? (customPermissions as any) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "USER_PERMISSIONS_UPDATED",
      entityType: "OrganizationMember",
      entityId: membership.id,
      metadata: { targetUserId, customPermissions },
    },
  });

  revalidatePath("/settings/users");
  return updatedMembership;
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
