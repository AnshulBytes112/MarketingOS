import { prisma } from '@abge/database';
import { getCurrentSession } from '@abge/auth';

export interface StrategyBoundaryResult {
  success: boolean;
  code: 'STRATEGY_NOT_AVAILABLE' | 'SUCCESS' | 'ERROR' | 'NO_ACTIVE_STRATEGY';
  error?: string;
  strategyRecordId?: string;
}

export class StrategyIntegrationBoundary {
  static isStrategyAvailable(): boolean {
    if (typeof globalThis !== 'undefined' && (globalThis as any).__mockStrategyAvailable !== undefined) {
      return (globalThis as any).__mockStrategyAvailable;
    }
    return true;
  }

  static async applyRecommendationToStrategy(params: {
    organizationId: string;
    brandId: string;
    recommendationId: string;
    action: string;
    recommendation: string;
  }): Promise<StrategyBoundaryResult> {
    if (!this.isStrategyAvailable()) {
      return {
        success: false,
        code: 'STRATEGY_NOT_AVAILABLE',
        error: 'Strategy integration is not yet available. The strategy domain consumer is pending implementation.',
      };
    }

    if (typeof globalThis !== 'undefined' && (globalThis as any).__mockStrategyAvailable === true) {
      return {
        success: true,
        code: 'SUCCESS',
        strategyRecordId: `simulated-strategy-${Date.now()}`,
      };
    }

    const session = await getCurrentSession();
    const userId = session?.userId || 'SYSTEM';

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Verify recommendation exists and matches tenant/brand
        const rec = await tx.aIRecommendation.findUnique({
          where: { id: params.recommendationId },
        });

        if (!rec || rec.organizationId !== params.organizationId || rec.brandId !== params.brandId) {
          throw new Error('Recommendation not found or access denied');
        }

        if (rec.status === 'APPLIED') {
          throw new Error('Recommendation already applied');
        }

        // 2. Load ACTIVE strategy for the brand
        const activeStrategy = await tx.strategy.findFirst({
          where: {
            brandId: params.brandId,
            organizationId: params.organizationId,
            publicationStatus: 'ACTIVE',
          },
        });

        if (!activeStrategy) {
          return {
            success: false,
            code: 'NO_ACTIVE_STRATEGY',
            error: 'No active strategy exists for this brand. Please generate a strategy first.',
          };
        }

        if (activeStrategy.approvalStatus === 'APPROVED') {
          return {
            success: false,
            code: 'ERROR',
            error: 'STRATEGY_LOCKED',
          };
        }

        // 3. Map recommendation type to Strategy field
        let field = 'campaignOpportunities';
        let previousValue: any = null;
        let newValue: any = null;

        if (rec.type === 'CONTENT_GAP') {
          field = 'contentPillars';
          const existing = (activeStrategy.contentPillars as any[]) || [];
          previousValue = existing;
          const newPillar = {
            name: `Pillar: ${params.action.substring(0, 30)}`,
            description: params.recommendation,
            objective: rec.observation.substring(0, 200),
            recommendedWeight: 20,
          };
          newValue = [...existing, newPillar];
        } else {
          field = 'campaignOpportunities';
          const existing = (activeStrategy.campaignOpportunities as any[]) || [];
          previousValue = existing;
          const newCampaign = {
            name: params.action.substring(0, 50) || 'Campaign Idea',
            objective: params.recommendation.substring(0, 200),
            audience: 'Target Audience',
            funnelStage: 'TOFU',
            suggestedPlatforms: ['Instagram', 'LinkedIn'],
            suggestedFormats: ['carousel', 'short_video'],
            rationale: rec.observation.substring(0, 200),
          };
          newValue = [...existing, newCampaign];
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
            organizationId: params.organizationId,
            brandId: params.brandId,
            strategyId: activeStrategy.id,
            userId,
            recommendationId: params.recommendationId,
            field,
            previousValue: previousValue ? (previousValue as any) : undefined,
            newValue: newValue ? (newValue as any) : undefined,
          },
        });

        // 6. Update AIRecommendation status to APPLIED
        await tx.aIRecommendation.update({
          where: { id: params.recommendationId },
          data: {
            status: 'APPLIED',
          },
        });

        // 7. Write to AuditLog
        await tx.auditLog.create({
          data: {
            organizationId: params.organizationId,
            userId,
            action: 'RECOMMENDATION_APPLIED',
            entityType: 'Strategy',
            entityId: activeStrategy.id,
            metadata: {
              recommendationId: params.recommendationId,
              field,
              strategyEditId: edit.id,
            },
          },
        });

        return {
          success: true,
          code: 'SUCCESS',
          strategyRecordId: activeStrategy.id,
        };
      });
    } catch (err: any) {
      return {
        success: false,
        code: 'ERROR',
        error: err.message,
      };
    }
  }
}
