-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'GENERATING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "BrandDNAStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "geography" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "positioning" TEXT,
ADD COLUMN     "priceSegment" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "usp" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "BrandAsset" ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "extractionStatus" "ExtractionStatus",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER;

-- CreateTable
CREATE TABLE "BrandProduct" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandCompetitor" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDNAVersion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "BrandDNAStatus" NOT NULL DEFAULT 'GENERATING',
    "personality" TEXT,
    "voice" TEXT,
    "tone" TEXT,
    "positioning" TEXT,
    "visualIdentitySummary" TEXT,
    "audience" TEXT,
    "contentPillars" JSONB,
    "language" TEXT,
    "ctaPreferences" TEXT,
    "avoidList" JSONB,
    "claims" JSONB,
    "constraints" JSONB,
    "confidenceScore" INTEGER,
    "sources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,

    CONSTRAINT "BrandDNAVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDNAEdit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "brandDNAVersionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL_EDIT',
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandDNAEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandProduct_brandId_idx" ON "BrandProduct"("brandId");

-- CreateIndex
CREATE INDEX "BrandProduct_organizationId_idx" ON "BrandProduct"("organizationId");

-- CreateIndex
CREATE INDEX "BrandCompetitor_brandId_idx" ON "BrandCompetitor"("brandId");

-- CreateIndex
CREATE INDEX "BrandCompetitor_organizationId_idx" ON "BrandCompetitor"("organizationId");

-- CreateIndex
CREATE INDEX "BrandDNAVersion_organizationId_idx" ON "BrandDNAVersion"("organizationId");

-- CreateIndex
CREATE INDEX "BrandDNAVersion_brandId_idx" ON "BrandDNAVersion"("brandId");

-- CreateIndex
CREATE INDEX "BrandDNAEdit_organizationId_idx" ON "BrandDNAEdit"("organizationId");

-- CreateIndex
CREATE INDEX "BrandDNAEdit_brandDNAVersionId_idx" ON "BrandDNAEdit"("brandDNAVersionId");

-- CreateIndex
CREATE INDEX "AIUsage_organizationId_idx" ON "AIUsage"("organizationId");

-- CreateIndex
CREATE INDEX "AIUsage_brandId_idx" ON "AIUsage"("brandId");

-- CreateIndex
CREATE INDEX "AIUsage_requestId_idx" ON "AIUsage"("requestId");

-- AddForeignKey
ALTER TABLE "BrandProduct" ADD CONSTRAINT "BrandProduct_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandProduct" ADD CONSTRAINT "BrandProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandCompetitor" ADD CONSTRAINT "BrandCompetitor_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandCompetitor" ADD CONSTRAINT "BrandCompetitor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAVersion" ADD CONSTRAINT "BrandDNAVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAVersion" ADD CONSTRAINT "BrandDNAVersion_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAVersion" ADD CONSTRAINT "BrandDNAVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAEdit" ADD CONSTRAINT "BrandDNAEdit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAEdit" ADD CONSTRAINT "BrandDNAEdit_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAEdit" ADD CONSTRAINT "BrandDNAEdit_brandDNAVersionId_fkey" FOREIGN KEY ("brandDNAVersionId") REFERENCES "BrandDNAVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDNAEdit" ADD CONSTRAINT "BrandDNAEdit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
