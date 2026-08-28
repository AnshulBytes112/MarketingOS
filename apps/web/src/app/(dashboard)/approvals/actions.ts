"use server";

import { requirePermission, requireAuth } from "@abge/auth";
import { prisma } from "@abge/database";
import { revalidatePath } from "next/cache";

export async function requestApproval(contentItemId: string, contentVersionId: string) {
  const session = await requireAuth();
  
  // Verify ownership
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId, organizationId: session.organizationId },
    include: { generations: { where: { id: contentVersionId } } },
  });

  if (!contentItem || contentItem.generations.length === 0) {
    throw new Error("Content item or version not found.");
  }

  // Create approval record
  const approval = await prisma.approval.create({
    data: {
      organizationId: session.organizationId,
      brandId: contentItem.brandId,
      contentItemId,
      contentVersionId,
      status: "PENDING",
      requestedById: session.userId,
    },
  });

  // Update item status if needed
  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: "READY_FOR_REVIEW" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "APPROVAL_REQUESTED",
      entityType: "Approval",
      entityId: approval.id,
      metadata: { contentItemId, contentVersionId },
    },
  });

  revalidatePath("/approvals");
  return approval;
}

export async function approveContent(approvalId: string) {
  const session = await requirePermission("approval.approve");

  const approval = await prisma.approval.findUnique({
    where: { id: approvalId, organizationId: session.organizationId },
    include: { contentItem: true },
  });

  if (!approval) throw new Error("Approval not found.");
  if (approval.status !== "PENDING") throw new Error("Approval is not pending.");

  const updatedApproval = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: "APPROVED",
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  // Automatically mark the content item as scheduled or published if required.
  // We'll leave it in READY_FOR_REVIEW or update to SCHEDULED for now.
  await prisma.contentItem.update({
    where: { id: approval.contentItemId },
    data: { status: "SCHEDULED" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CONTENT_APPROVED",
      entityType: "Approval",
      entityId: approvalId,
      metadata: { contentItemId: approval.contentItemId, contentVersionId: approval.contentVersionId },
    },
  });

  revalidatePath("/approvals");
  return updatedApproval;
}

export async function rejectContent(approvalId: string, reason: string) {
  const session = await requirePermission("approval.reject");

  if (!reason || reason.trim() === "") {
    throw new Error("Reason is required for rejection.");
  }

  const approval = await prisma.approval.findUnique({
    where: { id: approvalId, organizationId: session.organizationId },
  });

  if (!approval) throw new Error("Approval not found.");
  if (approval.status !== "PENDING") throw new Error("Approval is not pending.");

  const updatedApproval = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: "REJECTED",
      reason: reason.trim(),
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  await prisma.contentItem.update({
    where: { id: approval.contentItemId },
    data: { status: "DRAFT" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CONTENT_REJECTED",
      entityType: "Approval",
      entityId: approvalId,
      metadata: { reason: reason.trim(), contentItemId: approval.contentItemId, contentVersionId: approval.contentVersionId },
    },
  });

  revalidatePath("/approvals");
  return updatedApproval;
}

export async function requestChanges(approvalId: string, reason: string) {
  const session = await requirePermission("approval.request_changes");

  if (!reason || reason.trim() === "") {
    throw new Error("Reason is required for requesting changes.");
  }

  const approval = await prisma.approval.findUnique({
    where: { id: approvalId, organizationId: session.organizationId },
  });

  if (!approval) throw new Error("Approval not found.");
  if (approval.status !== "PENDING") throw new Error("Approval is not pending.");

  const updatedApproval = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: "CHANGES_REQUESTED",
      reason: reason.trim(),
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
  });

  await prisma.contentItem.update({
    where: { id: approval.contentItemId },
    data: { status: "DRAFT" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CONTENT_CHANGES_REQUESTED",
      entityType: "Approval",
      entityId: approvalId,
      metadata: { reason: reason.trim(), contentItemId: approval.contentItemId, contentVersionId: approval.contentVersionId },
    },
  });

  revalidatePath("/approvals");
  return updatedApproval;
}

export async function getApprovalQueue() {
  const session = await requireAuth();

  const approvals = await prisma.approval.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contentItem: true,
      contentVersion: true,
      requestedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return approvals;
}
