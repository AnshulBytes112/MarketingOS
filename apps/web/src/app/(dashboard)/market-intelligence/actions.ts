'use server';

import { prisma as dbPrisma, recreatePrismaClient } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueueMarketIntelligence } from '../../../lib/queue';
import { MarketInsightType, InsightConfidence } from '@prisma/client';
import crypto from 'crypto';

const prisma = (() => {
  if (dbPrisma && 'marketInsight' in dbPrisma) {
    return dbPrisma;
  }
  return recreatePrismaClient();
})();

export async function getMarketInsights(params: {
  brandId: string;
  type?: string;
  confidence?: string;
  minRelevance?: number;
  searchQuery?: string;
}) {
  const session = await requireAuth();
  await requirePermission('market.view');

  // Enforce tenant isolation for the brand
  const brand = await prisma.brand.findFirst({
    where: { id: params.brandId, organizationId: session.organizationId },
  });
  if (!brand) throw new Error('Brand not found or unauthorized');

  const whereClause: any = {
    organizationId: session.organizationId,
    brandId: params.brandId,
  };

  if (params.type && params.type !== 'ALL') {
    whereClause.type = params.type as MarketInsightType;
  }

  if (params.confidence && params.confidence !== 'ALL') {
    whereClause.confidence = params.confidence as InsightConfidence;
  }

  if (params.minRelevance && params.minRelevance > 0) {
    whereClause.relevanceScore = { gte: params.minRelevance };
  }

  if (params.searchQuery) {
    whereClause.OR = [
      { title: { contains: params.searchQuery, mode: 'insensitive' } },
      { summary: { contains: params.searchQuery, mode: 'insensitive' } },
      { description: { contains: params.searchQuery, mode: 'insensitive' } },
    ];
  }

  return prisma.marketInsight.findMany({
    where: whereClause,
    orderBy: [
      { relevanceScore: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getLatestRunStatus(brandId: string) {
  const session = await requireAuth();
  await requirePermission('market.view');

  // Enforce tenant isolation
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId },
  });
  if (!brand) throw new Error('Brand not found or unauthorized');

  return prisma.marketIntelligenceRun.findFirst({
    where: { brandId, organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function refreshMarketIntelligence(brandId: string) {
  const session = await requireAuth();
  await requirePermission('market.refresh');

  // Enforce tenant isolation
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId },
  });
  if (!brand) throw new Error('Brand not found or unauthorized');

  // IDEMPOTENCY check: see if there is a running/queued run
  const activeRun = await prisma.marketIntelligenceRun.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      status: { in: ['QUEUED', 'ANALYZING'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeRun) {
    console.log(`[Market Intelligence Action] Active run ${activeRun.id} already exists. Returning existing run for idempotency.`);
    return { success: true, run: activeRun };
  }

  // Create new run
  const newRun = await prisma.marketIntelligenceRun.create({
    data: {
      brandId,
      organizationId: session.organizationId,
      status: 'QUEUED',
    },
  });

  // Enqueue job in BullMQ
  await enqueueMarketIntelligence({
    organizationId: session.organizationId,
    brandId,
    runId: newRun.id,
    userId: session.userId,
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'MARKET_INTELLIGENCE_REFRESH_REQUESTED',
      entityType: 'MarketIntelligenceRun',
      entityId: newRun.id,
      metadata: { brandId },
    },
  });

  return { success: true, run: newRun };
}

export async function useOpportunityInContent(params: {
  insightId: string;
  scheduledDate: string;
  funnelStage?: string;
  contentPillar?: string;
}) {
  const session = await requireAuth();
  // Enforce create content permission
  await requirePermission('content.create');

  // 1. Fetch Insight
  const insight = await prisma.marketInsight.findUnique({
    where: { id: params.insightId },
  });

  if (!insight || insight.organizationId !== session.organizationId) {
    throw new Error('Insight not found or unauthorized');
  }

  const { brandId } = insight;

  // 2. Fetch Active Strategy and Content Plan
  const activeStrategy = await prisma.strategy.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      publicationStatus: 'ACTIVE',
      status: 'COMPLETED',
    },
    orderBy: { version: 'desc' },
  });

  if (!activeStrategy) {
    throw new Error('An active, completed strategy is required to create a content idea.');
  }

  const contentPlan = await prisma.contentPlan.findFirst({
    where: { brandId, organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!contentPlan) {
    throw new Error('A content plan is required to create a content idea.');
  }

  // 3. Extract content details
  const coRaw = insight.contentOpportunities as any;
  const title = coRaw?.title || insight.title;
  const platform = coRaw?.platform || 'LinkedIn';
  const format = coRaw?.format || 'Text Post';
  const hook = coRaw?.hook || insight.summary;
  const cta = coRaw?.suggestedCta || 'Learn More';

  // 4. Create ContentItem manually (no automatic content generation!)
  const contentItemId = crypto.randomUUID();
  const contentItem = await prisma.contentItem.create({
    data: {
      id: contentItemId,
      organizationId: session.organizationId,
      brandId,
      contentPlanId: contentPlan.id,
      strategyId: activeStrategy.id,
      title,
      platform,
      format,
      scheduledDate: new Date(params.scheduledDate),
      funnelStage: params.funnelStage || 'AWARENESS',
      contentPillar: params.contentPillar || 'Brand Positioning',
      hook,
      cta,
      source: 'AI_OPPORTUNITY',
      status: 'DRAFT',
      version: 1,
    },
  });

  // 5. Log Action
  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'CONTENT_ITEM_CREATED',
      entityType: 'ContentItem',
      entityId: contentItemId,
      metadata: {
        title,
        source: 'AI_OPPORTUNITY',
        insightId: params.insightId,
      },
    },
  });

  return { success: true, item: contentItem };
}
