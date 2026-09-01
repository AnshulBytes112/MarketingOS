'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueueStrategyGeneration, enqueueContentPlanGeneration } from '@/lib/queue';
import { z } from 'zod';
import {
  StrategyCampaignOpportunitySchema,
  StrategyContentPillarSchema,
  StrategyContentMixItemSchema,
} from '../../../../../worker/src/strategy.schema';

// Operation Schema for applying recommendations
const ApplyOperationSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('ADD_CAMPAIGN_OPPORTUNITY'),
    payload: StrategyCampaignOpportunitySchema,
  }),
  z.object({
    operation: z.literal('ADD_CONTENT_PILLAR'),
    payload: StrategyContentPillarSchema,
  }),
  z.object({
    operation: z.literal('UPDATE_CONTENT_MIX'),
    payload: z.array(StrategyContentMixItemSchema),
  }),
]);

export async function getActiveStrategy(brandId: string) {
  const session = await requireAuth();

  // Verify brand ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId },
  });

  if (!brand) {
    throw new Error('Brand not found or access denied');
  }

  return prisma.strategy.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      publicationStatus: 'ACTIVE',
    },
  });
}

export async function getStrategyGenerationStatus(brandId: string) {
  const session = await requireAuth();

  // Verify brand ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId },
  });

  if (!brand) {
    throw new Error('Brand not found or access denied');
  }

  return prisma.strategy.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      status: 'GENERATING',
    },
  });
}

export async function regenerateStrategy(brandId: string) {
  const session = await requirePermission('strategy.generate');

  // Verify brand ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, organizationId: session.organizationId },
  });

  if (!brand) {
    throw new Error('Brand not found or access denied');
  }

  // Check if active strategy is approved/locked
  const activeStrategy = await prisma.strategy.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      publicationStatus: 'ACTIVE',
    },
  });

  if (activeStrategy && activeStrategy.approvalStatus === 'APPROVED') {
    return { success: false, error: 'STRATEGY_LOCKED' };
  }

  // Check if a generation is already in progress
  const activeGenerating = await prisma.strategy.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
      status: 'GENERATING',
    },
  });

  if (activeGenerating) {
    return { success: false, error: 'GENERATION_ALREADY_IN_PROGRESS' };
  }


  // Determine next version number
  const versionAggregation = await prisma.strategy.aggregate({
    where: { brandId, organizationId: session.organizationId },
    _max: { version: true },
  });
  const nextVersion = (versionAggregation._max.version || 0) + 1;

  // Create new strategy record in GENERATING / DRAFT state
  const strategy = await prisma.strategy.create({
    data: {
      organizationId: session.organizationId,
      brandId,
      version: nextVersion,
      status: 'GENERATING',
      publicationStatus: 'DRAFT',
      createdById: session.userId,
    },
  });

  // Enqueue BullMQ job
  try {
    await enqueueStrategyGeneration({
      organizationId: session.organizationId,
      brandId,
      strategyId: strategy.id,
      userId: session.userId,
      source: 'MANUAL',
    });
  } catch (err) {
    console.error('Failed to enqueue strategy generation job:', err);
    // Mark strategy record as FAILED immediately if enqueuing fails
    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { status: 'FAILED' },
    });
    return { success: false, error: 'FAILED_TO_ENQUEUE_JOB' };
  }

  return { success: true, strategy };
}

export async function getStrategyById(id: string) {
  const session = await requireAuth();

  const strategy = await prisma.strategy.findUnique({
    where: { id },
  });

  if (!strategy || strategy.organizationId !== session.organizationId) {
    throw new Error('Strategy not found or access denied');
  }

  return strategy;
}

export async function applyRecommendationToStrategyAction(
  recommendationId: string,
  operationInput: unknown
) {
  const session = await requirePermission('strategy.apply_recommendation');

  // Perform Apply mutation inside a database transaction
  return prisma.$transaction(async (tx) => {
    // 1. Verify recommendation exists and belongs to same tenant
    const rec = await tx.aIRecommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!rec || rec.organizationId !== session.organizationId) {
      throw new Error('Recommendation not found or access denied');
    }

    if (rec.status === 'APPLIED') {
      throw new Error('Recommendation already applied');
    }

    // 2. Validate operation schema
    const validated = ApplyOperationSchema.parse(operationInput);

    // 3. Load ACTIVE strategy for the brand
    const activeStrategy = await tx.strategy.findFirst({
      where: {
        brandId: rec.brandId,
        organizationId: session.organizationId,
        publicationStatus: 'ACTIVE',
      },
    });

    if (!activeStrategy) {
      throw new Error('NO_ACTIVE_STRATEGY');
    }

    if (activeStrategy.approvalStatus === 'APPROVED') {
      throw new Error('STRATEGY_LOCKED');
    }

    let field = '';
    let previousValue: any = null;
    let newValue: any = null;

    if (validated.operation === 'ADD_CAMPAIGN_OPPORTUNITY') {
      field = 'campaignOpportunities';
      const existing = (activeStrategy.campaignOpportunities as any[]) || [];
      previousValue = existing;
      newValue = [...existing, validated.payload];
    } else if (validated.operation === 'ADD_CONTENT_PILLAR') {
      field = 'contentPillars';
      const existing = (activeStrategy.contentPillars as any[]) || [];
      previousValue = existing;
      newValue = [...existing, validated.payload];
    } else if (validated.operation === 'UPDATE_CONTENT_MIX') {
      field = 'contentMix';
      previousValue = activeStrategy.contentMix;
      
      // Validate percentages sum to exactly 100
      const mixSum = validated.payload.reduce((sum, item) => sum + item.percentage, 0);
      if (Math.abs(mixSum - 100) > 0.01) {
        throw new Error(`Content mix percentages must sum to 100%, got ${mixSum}%`);
      }
      
      newValue = validated.payload;
    }

    // 4. Mutate Strategy field
    await tx.strategy.update({
      where: { id: activeStrategy.id },
      data: {
        [field]: newValue,
      },
    });

    // 5. Create StrategyEdit audit trail
    const edit = await tx.strategyEdit.create({
      data: {
        organizationId: session.organizationId,
        brandId: rec.brandId,
        strategyId: activeStrategy.id,
        userId: session.userId,
        recommendationId,
        field,
        previousValue: previousValue ? (previousValue as any) : undefined,
        newValue: newValue ? (newValue as any) : undefined,
      },
    });

    // 6. Update AIRecommendation status to APPLIED
    await tx.aIRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: 'APPLIED',
      },
    });

    // 7. Write to AuditLog
    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'RECOMMENDATION_APPLIED',
        entityType: 'Strategy',
        entityId: activeStrategy.id,
        metadata: {
          recommendationId,
          operation: validated.operation,
          field,
          strategyEditId: edit.id,
        },
      },
    });

    return { success: true, strategyId: activeStrategy.id };
  });
}

export async function approveStrategy(brandId: string, strategyId: string) {
  const session = await requirePermission('strategy.approve');

  // Verify the Strategy belongs to the authenticated user's organization and brand.
  const strategy = await prisma.strategy.findFirst({
    where: {
      id: strategyId,
      brandId,
      organizationId: session.organizationId,
    },
  });

  if (!strategy) {
    throw new Error('Strategy not found or access denied');
  }

  if (strategy.publicationStatus !== 'ACTIVE') {
    throw new Error('Only the current ACTIVE Strategy can be approved');
  }

  if (strategy.status !== 'COMPLETED') {
    throw new Error('Strategy is not completed');
  }

  if (strategy.approvalStatus === 'APPROVED') {
    throw new Error('Strategy is already approved');
  }

  // Approval must be transactional: approval + locking + AuditLog must be one transaction.
  return prisma.$transaction(async (tx) => {
    const updatedStrategy = await tx.strategy.update({
      where: { id: strategyId },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedById: session.userId,
        lockedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'STRATEGY_APPROVED',
        entityType: 'Strategy',
        entityId: strategyId,
        metadata: {
          brandId,
          version: strategy.version,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'STRATEGY_LOCKED',
        entityType: 'Strategy',
        entityId: strategyId,
        metadata: {
          brandId,
          version: strategy.version,
        },
      },
    });

    return { success: true, strategy: updatedStrategy };
  });
}

export async function generateContentCalendar(strategyId: string) {
  const session = await requirePermission('calendar.create');

  // Verify ownership of Strategy
  const strategy = await prisma.strategy.findFirst({
    where: {
      id: strategyId,
      organizationId: session.organizationId,
    },
  });

  if (!strategy) {
    throw new Error('Strategy not found or access denied');
  }

  // Confirm Strategy is APPROVED
  if (strategy.approvalStatus !== 'APPROVED') {
    throw new Error('Only approved strategies can be used to generate a calendar');
  }

  // Prevent concurrent ContentPlan generation for this brand
  const activeGenerating = await prisma.contentPlan.findFirst({
    where: {
      brandId: strategy.brandId,
      organizationId: session.organizationId,
      status: 'GENERATING',
    },
  });

  if (activeGenerating) {
    return { success: false, error: 'CALENDAR_GENERATION_ALREADY_IN_PROGRESS', contentPlanId: activeGenerating.id };
  }

  // Create ContentPlan record in GENERATING state and enqueue in transaction
  const result = await prisma.$transaction(async (tx) => {
    const contentPlan = await tx.contentPlan.create({
      data: {
        organizationId: session.organizationId,
        brandId: strategy.brandId,
        strategyId: strategy.id,
        status: 'GENERATING',
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'CALENDAR_GENERATION_REQUESTED',
        entityType: 'ContentPlan',
        entityId: contentPlan.id,
        metadata: {
          brandId: strategy.brandId,
          strategyId: strategy.id,
        },
      },
    });

    return contentPlan;
  });

  // Enqueue job in BullMQ
  await enqueueContentPlanGeneration({
    organizationId: session.organizationId,
    brandId: strategy.brandId,
    strategyId: strategy.id,
    userId: session.userId,
  });

  return { success: true, contentPlanId: result.id };
}

export async function getContentPlanStatus(contentPlanId: string) {
  const session = await requirePermission('calendar.view');

  const plan = await prisma.contentPlan.findFirst({
    where: {
      id: contentPlanId,
      organizationId: session.organizationId,
    },
  });

  if (!plan) {
    throw new Error('Content plan not found');
  }

  return { status: plan.status };
}

export async function getLatestContentPlan(brandId: string) {
  const session = await requirePermission('calendar.view');

  const plan = await prisma.contentPlan.findFirst({
    where: {
      brandId,
      organizationId: session.organizationId,
    },
    orderBy: { createdAt: 'desc' },
  });

  return plan;
}

