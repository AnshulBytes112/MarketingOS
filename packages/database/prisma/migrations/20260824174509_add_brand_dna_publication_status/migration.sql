-- CreateEnum
CREATE TYPE "BrandDNAPublicationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "BrandDNAVersion" ADD COLUMN     "publicationStatus" "BrandDNAPublicationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "restoredFromVersionId" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'AI_GENERATION';
