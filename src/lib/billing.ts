import { prisma } from '@/lib/db';
import { PlanTier } from '@prisma/client';

const PLAN_HIERARCHY: Record<PlanTier, number> = {
  STARTER: 1,
  GROWTH: 2,
  SCALE: 3,
};

export async function checkPlanEntitlement(organizationId: string, requiredTier: PlanTier): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true }
  });

  if (!org) return false;

  const currentLevel = PLAN_HIERARCHY[org.planTier];
  const requiredLevel = PLAN_HIERARCHY[requiredTier];

  return currentLevel >= requiredLevel;
}

export async function requirePlanEntitlement(organizationId: string, requiredTier: PlanTier): Promise<void> {
  const hasEntitlement = await checkPlanEntitlement(organizationId, requiredTier);
  if (!hasEntitlement) {
    throw new Error(`PAYMENT_REQUIRED: Organization requires ${requiredTier} plan.`);
  }
}
