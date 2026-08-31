import { Worker, Job } from 'bullmq';
import { prisma } from '@abge/database';
import { ModelGateway } from './ai/gateway';
import { CampaignProposalSchema } from './campaign-planning.schema';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const gateway = new ModelGateway();

export const campaignPlanningWorker = new Worker(
  'campaign-planning',
  async (job: Job) => {
    const { campaignId, organizationId, brandId, userId } = job.data;
    const requestId = `campaign-plan-${campaignId}-${Date.now()}`;

    console.log(`[Campaign Planning Worker] Processing job for campaign: ${campaignId}`);

    // Fetch the campaign, brand, and strategy
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        channels: {
          include: { contentChannel: true }
        }
      }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    let strategyContext = "";
    if (campaign.strategyId) {
      const strategy = await prisma.strategy.findUnique({
        where: { id: campaign.strategyId }
      });
      if (strategy) {
        strategyContext = `Approved Strategy Context:
${JSON.stringify(strategy.contentPillars, null, 2)}
${JSON.stringify(strategy.audienceSegments, null, 2)}
`;
      }
    }

    const channelContext = campaign.channels.map(c => 
      `- ID: ${c.contentChannelId}, Platform: ${c.contentChannel.platform}, Name: ${c.contentChannel.name}`
    ).join('\n');

    const prompt = `
Brand: ${brand?.name}
Campaign Name: ${campaign.name}
Objective: ${campaign.objective || "Not specified"}
Audience: ${campaign.audience ? JSON.stringify(campaign.audience) : "Use strategy audience"}
Timeframe: ${campaign.startDate ? new Date(campaign.startDate).toISOString() : 'TBD'} to ${campaign.endDate ? new Date(campaign.endDate).toISOString() : 'TBD'}

${strategyContext}

Available Channels for this campaign (YOU MUST ONLY USE THESE IDs IN YOUR CHANNEL PLAN):
${channelContext}

Propose a detailed campaign plan with phases, suggested themes, KPIs, and a specific channel content allocation.
`;

    try {
      const result = await gateway.generateStructured(
        process.env.AI_MODEL || 'gpt-4o',
        "You are an expert marketing strategist. Create a structured campaign plan based on the provided details.",
        prompt,
        CampaignProposalSchema,
        "CampaignProposal",
        "Proposed campaign plan phases, channels, and KPIs",
        requestId
      );

      // Record AI Usage
      await prisma.aIUsage.create({
        data: {
          organizationId,
          brandId,
          requestId,
          provider: process.env.AI_PROVIDER || 'openai',
          model: process.env.AI_MODEL || 'gpt-4o',
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          totalTokens: result.usage.totalTokens,
          latencyMs: result.usage.latencyMs,
          estimatedCost: result.usage.estimatedCost,
          status: 'SUCCESS',
        },
      });

      // Update the campaign with the proposal
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          aiProposal: result.data as any,
        },
      });

      console.log(`[Campaign Planning Worker] Successfully generated plan for campaign: ${campaignId}`);
      return { success: true, campaignId };
    } catch (error) {
      console.error(`[Campaign Planning Worker] Failed to generate plan:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

campaignPlanningWorker.on('completed', (job) => {
  console.log(`[Campaign Planning] Job ${job.id} completed successfully`);
});

campaignPlanningWorker.on('failed', (job, err) => {
  console.error(`[Campaign Planning] Job ${job?.id} failed:`, err);
});

