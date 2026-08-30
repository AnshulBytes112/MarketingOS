import { z } from "zod";

export const CampaignProposalSchema = z.object({
  summary: z.string(),
  reasoning: z.string(),
  phases: z.array(
    z.object({
      name: z.string(),
      goal: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      description: z.string(),
    })
  ).optional(),
  suggestedThemes: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      recommendedChannels: z.array(z.string()),
      suggestedContentCount: z.number(),
    })
  ).optional(),
  suggestedKPIs: z.array(
    z.object({
      metric: z.string(),
      targetValue: z.number(),
      unit: z.string(),
      reason: z.string(),
    })
  ).optional(),
  channelPlan: z.array(
    z.object({
      contentChannelId: z.string(),
      platform: z.string().optional(),
      format: z.string().optional(),
      purpose: z.string(),
      suggestedContentCount: z.number(),
    })
  ).optional(),
  warnings: z.array(z.string()).optional(),
});
