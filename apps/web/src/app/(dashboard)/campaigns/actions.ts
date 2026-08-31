"use server";

import { requireAuth, requirePermission } from "@abge/auth";
import { prisma } from "@abge/database";
import { CampaignStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { enqueueCampaignPlanning } from "@/lib/queue";
import { z } from "zod";
import crypto from "crypto";

// Allowed transitions
const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ["PLANNING", "ACTIVE"],
  PLANNING: ["ACTIVE", "DRAFT"],
  ACTIVE: ["PAUSED", "COMPLETED"],
  PAUSED: ["ACTIVE", "COMPLETED"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED: [],
};

const KPISchema = z.object({
  metric: z.string().min(1),
  targetValue: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  baselineValue: z.number().nullable().optional(),
  timeframe: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export async function createCampaign(data: {
  name: string;
  brandId: string;
  objective?: string;
  startDate?: Date;
  endDate?: Date;
  strategyId?: string;
  strategyVersion?: number;
  channels?: string[];
  kpis?: z.infer<typeof KPISchema>[];
}) {
  const session = await requirePermission("campaign.create");

  // Validate brand ownership
  const brand = await prisma.brand.findUnique({
    where: { id: data.brandId, organizationId: session.organizationId },
  });

  if (!brand) {
    throw new Error("Brand not found or access denied.");
  }

  let { strategyId, strategyVersion } = data;

  if (!strategyId) {
    const activeStrategy = await prisma.strategy.findFirst({
      where: { brandId: data.brandId, organizationId: session.organizationId, publicationStatus: 'ACTIVE', status: 'COMPLETED' },
    });
    if (activeStrategy) {
      strategyId = activeStrategy.id;
      strategyVersion = activeStrategy.version;
    }
  }

  // Validate strategy ownership
  if (strategyId) {
    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId, organizationId: session.organizationId, brandId: data.brandId },
    });
    if (!strategy) throw new Error("Strategy not found or access denied.");
  }

  const campaign = await prisma.campaign.create({
    data: {
      organizationId: session.organizationId,
      brandId: data.brandId,
      name: data.name,
      objective: data.objective,
      startDate: data.startDate,
      endDate: data.endDate,
      strategyId: strategyId,
      strategyVersion: strategyVersion,
      createdById: session.userId,
      kpis: data.kpis ? {
        create: data.kpis.map(k => ({
          metric: k.metric,
          targetValue: k.targetValue,
          unit: k.unit,
          baselineValue: k.baselineValue,
          timeframe: k.timeframe,
          source: k.source,
        }))
      } : undefined,
      channels: data.channels ? {
        create: data.channels.map(channelId => ({
          organizationId: session.organizationId,
          contentChannelId: channelId,
        }))
      } : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CAMPAIGN_CREATED",
      entityType: "Campaign",
      entityId: campaign.id,
    },
  });

  revalidatePath("/campaigns");
  return campaign;
}

export async function updateCampaign(campaignId: string, data: {
  name?: string;
  description?: string;
  objective?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  audience?: any;
}) {
  const session = await requirePermission("campaign.edit");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, organizationId: session.organizationId },
  });

  if (!campaign) throw new Error("Campaign not found.");

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name: data.name,
      description: data.description,
      objective: data.objective,
      startDate: data.startDate,
      endDate: data.endDate,
      audience: data.audience,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CAMPAIGN_UPDATED",
      entityType: "Campaign",
      entityId: campaign.id,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  return updated;
}

export async function updateCampaignStatus(campaignId: string, newStatus: CampaignStatus) {
  const session = await requirePermission("campaign.edit");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, organizationId: session.organizationId },
  });

  if (!campaign) throw new Error("Campaign not found.");

  if (!ALLOWED_TRANSITIONS[campaign.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${campaign.status} to ${newStatus}`);
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: `CAMPAIGN_${newStatus}`,
      entityType: "Campaign",
      entityId: campaign.id,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  return updated;
}

export async function generateCampaignPlan(campaignId: string) {
  const session = await requirePermission("campaign.generate_plan");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, organizationId: session.organizationId },
  });

  if (!campaign) throw new Error("Campaign not found.");

  await enqueueCampaignPlanning({
    campaignId: campaign.id,
    organizationId: session.organizationId,
    brandId: campaign.brandId,
    userId: session.userId,
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CAMPAIGN_PLAN_GENERATED",
      entityType: "Campaign",
      entityId: campaign.id,
    },
  });

  return { queued: true };
}

export async function applyCampaignPlan(campaignId: string) {
  const session = await requirePermission("campaign.edit");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, organizationId: session.organizationId },
  });

  if (!campaign) throw new Error("Campaign not found.");
  if (!campaign.aiProposal) throw new Error("No AI proposal available to apply.");

  const proposal = campaign.aiProposal as any;
  if (!proposal.channelPlan || !Array.isArray(proposal.channelPlan)) {
    throw new Error("Invalid proposal format.");
  }

  // Find or create ContentPlan
  let contentPlan = await prisma.contentPlan.findFirst({
    where: { campaignId, organizationId: session.organizationId },
  });

  if (!contentPlan) {
    // Requires a strategy linkage in the campaign
    let targetStrategyId = campaign.strategyId;
    if (!targetStrategyId) {
      const activeStrategy = await prisma.strategy.findFirst({
        where: { brandId: campaign.brandId, organizationId: session.organizationId, publicationStatus: 'ACTIVE', status: 'COMPLETED' },
      });
      if (!activeStrategy) {
        throw new Error("Campaign must be linked to a strategy to apply plans, and no active strategy was found.");
      }
      targetStrategyId = activeStrategy.id;
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { strategyId: targetStrategyId, strategyVersion: activeStrategy.version }
      });
    }
    
    contentPlan = await prisma.contentPlan.create({
      data: {
        organizationId: session.organizationId,
        brandId: campaign.brandId,
        strategyId: targetStrategyId,
        campaignId: campaign.id,
        status: "COMPLETED",
      }
    });
  }

  // Fetch valid channels to prevent AI hallucinations causing FK errors
  const validChannels = await prisma.contentChannel.findMany({
    where: { brandId: campaign.brandId, organizationId: session.organizationId },
    select: { id: true }
  });
  const validChannelIds = new Set(validChannels.map(c => c.id));

  // Create content items based on the proposal
  const contentItemsData = [];
  let itemCounter = 1;

  // Calculate total items to space them evenly
  let totalItems = 0;
  for (const channelItem of proposal.channelPlan) {
    totalItems += channelItem.suggestedContentCount || 1;
  }

  const start = campaign.startDate ? new Date(campaign.startDate) : new Date();
  const end = campaign.endDate ? new Date(campaign.endDate) : start;
  const durationMs = end.getTime() - start.getTime();
  const stepMs = totalItems > 1 && durationMs > 0 ? durationMs / (totalItems - 1) : 0;

  let itemIndex = 0;
  for (const channelItem of proposal.channelPlan) {
    const count = channelItem.suggestedContentCount || 1;
    for (let i = 0; i < count; i++) {
      const scheduledDate = new Date(start.getTime() + itemIndex * stepMs);
      contentItemsData.push({
        id: `ci_${crypto.randomBytes(12).toString("hex")}`,
        organizationId: session.organizationId,
        brandId: campaign.brandId,
        contentPlanId: contentPlan.id,
        strategyId: contentPlan.strategyId,
        campaignId: campaign.id,
        contentChannelId: validChannelIds.has(channelItem.contentChannelId) ? channelItem.contentChannelId : null,
        title: `${campaign.name} Content ${itemCounter}`,
        platform: channelItem.platform || "Platform",
        format: channelItem.format || "Post",
        scheduledDate,
        funnelStage: channelItem.purpose || "Awareness",
        contentPillar: proposal.suggestedThemes?.[0]?.name || "Theme",
        status: "DRAFT",
        source: "AI_PLANNING",
      });
      itemIndex++;
      itemCounter++;
    }
  }

  if (contentItemsData.length > 0) {
    await prisma.contentItem.createMany({
      data: contentItemsData as any,
    });
  }

  // Clear proposal
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { aiProposal: null as any },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: "CAMPAIGN_PLAN_APPLIED",
      entityType: "Campaign",
      entityId: campaign.id,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true, createdCount: contentItemsData.length };
}
