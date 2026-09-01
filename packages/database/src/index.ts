export * from './client';

// Export type declarations for everything
export type * from '@prisma/client';

// Export Prisma namespace and PrismaClient value
export { Prisma, PrismaClient } from '@prisma/client';

// Export Enums manually to prevent Next.js CommonJS export warnings
export {
  Role,
  OrganizationStatus,
  OnboardingStatus,
  BrandDNAStatus,
  BrandDNAPublicationStatus,
  PlanTier,
  PlatformRole,
  ExtractionStatus,
  StrategyApprovalStatus,
  ContentPlanStatus,
  ContentItemStatus,
  StrategyPublicationStatus,
  MarketInsightType,
  InsightConfidence,
  MarketIntelligenceStatus
} from '@prisma/client';
