import { prisma } from '@/lib/db';

export type FlagName = 'BETA_FEATURES' | 'ADVANCED_ANALYTICS' | 'CUSTOM_DOMAINS';

export async function isFeatureEnabled(
  organizationId: string, 
  flagName: FlagName | string, 
  defaultValue: boolean = false
): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: {
        organizationId_flagName: {
          organizationId,
          flagName,
        },
      },
    });

    if (flag) {
      return flag.enabled;
    }

    return defaultValue;
  } catch (error) {
    console.error(`Error checking feature flag ${flagName} for org ${organizationId}:`, error);
    return defaultValue;
  }
}

export async function setFeatureFlag(
  organizationId: string,
  flagName: FlagName | string,
  enabled: boolean
): Promise<void> {
  await prisma.featureFlag.upsert({
    where: {
      organizationId_flagName: {
        organizationId,
        flagName,
      },
    },
    update: { enabled },
    create: {
      organizationId,
      flagName,
      enabled,
    },
  });
}
