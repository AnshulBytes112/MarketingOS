-- CreateTable
CREATE TABLE "CompetitorAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "profileUrl" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "followerCount" INTEGER,
    "followingCount" INTEGER,
    "postCount" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorPost" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "competitorAccountId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalPostId" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "captionText" TEXT,
    "mediaType" TEXT,
    "likeCount" INTEGER,
    "commentCount" INTEGER,
    "shareCount" INTEGER,
    "viewCount" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" TEXT NOT NULL,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "likelyCause" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sources" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorAccount_brandId_idx" ON "CompetitorAccount"("brandId");

-- CreateIndex
CREATE INDEX "CompetitorAccount_organizationId_idx" ON "CompetitorAccount"("organizationId");

-- CreateIndex
CREATE INDEX "CompetitorAccount_competitorId_idx" ON "CompetitorAccount"("competitorId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorAccount_organizationId_competitorId_platform_key" ON "CompetitorAccount"("organizationId", "competitorId", "platform");

-- CreateIndex
CREATE INDEX "CompetitorPost_brandId_idx" ON "CompetitorPost"("brandId");

-- CreateIndex
CREATE INDEX "CompetitorPost_organizationId_idx" ON "CompetitorPost"("organizationId");

-- CreateIndex
CREATE INDEX "CompetitorPost_competitorId_idx" ON "CompetitorPost"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorPost_competitorAccountId_idx" ON "CompetitorPost"("competitorAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPost_organizationId_competitorAccountId_externalP_key" ON "CompetitorPost"("organizationId", "competitorAccountId", "externalPostId");

-- CreateIndex
CREATE INDEX "AIRecommendation_brandId_idx" ON "AIRecommendation"("brandId");

-- CreateIndex
CREATE INDEX "AIRecommendation_organizationId_idx" ON "AIRecommendation"("organizationId");

-- CreateIndex
CREATE INDEX "AIRecommendation_competitorId_idx" ON "AIRecommendation"("competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorAccount" ADD CONSTRAINT "CompetitorAccount_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorAccount" ADD CONSTRAINT "CompetitorAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorAccount" ADD CONSTRAINT "CompetitorAccount_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "BrandCompetitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "BrandCompetitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_competitorAccountId_fkey" FOREIGN KEY ("competitorAccountId") REFERENCES "CompetitorAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "BrandCompetitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
