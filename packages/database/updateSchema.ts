import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const schemaPath = path.resolve(__dirname, 'prisma/schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf-8');

  // Insert relations into model Organization
  const orgSearch = 'model Organization {';
  const orgIndex = schema.indexOf(orgSearch);
  if (orgIndex === -1) throw new Error('Organization model not found');
  const orgBraceIndex = schema.indexOf('}', orgIndex);
  schema = schema.slice(0, orgBraceIndex) + 
    '  marketInsights        MarketInsight[]\n' +
    '  marketIntelligenceRuns MarketIntelligenceRun[]\n' +
    schema.slice(orgBraceIndex);

  // Insert relations into model Brand
  const brandSearch = 'model Brand {';
  const brandIndex = schema.indexOf(brandSearch);
  if (brandIndex === -1) throw new Error('Brand model not found');
  const brandBraceIndex = schema.indexOf('}', brandIndex);
  schema = schema.slice(0, brandBraceIndex) +
    '  marketInsights        MarketInsight[]\n' +
    '  marketIntelligenceRuns MarketIntelligenceRun[]\n' +
    schema.slice(brandBraceIndex);

  // Insert relation into model Campaign
  const campaignSearch = 'model Campaign {';
  const campaignIndex = schema.indexOf(campaignSearch);
  if (campaignIndex === -1) throw new Error('Campaign model not found');
  const campaignBraceIndex = schema.indexOf('}', campaignIndex);
  schema = schema.slice(0, campaignBraceIndex) +
    '  marketInsights        MarketInsight[]\n' +
    schema.slice(campaignBraceIndex);

  // Append the new models and enums at the bottom
  const newModelsAndEnums = `
model MarketInsight {
  id                  String             @id @default(cuid())
  organizationId      String
  brandId             String
  type                MarketInsightType
  title               String
  summary             String
  description         String?
  source              String
  sourceUrl           String?
  observedAt          DateTime           @default(now())
  relevanceScore      Int                @default(0)
  confidence          InsightConfidence  @default(MEDIUM)
  data                Json?
  implications        Json?
  opportunities       Json?
  risks               Json?
  contentOpportunities Json?
  relatedCompetitorIds Json?             // JSON array of competitor IDs
  relatedCampaignId   String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  organization        Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  brand               Brand              @relation(fields: [brandId], references: [id], onDelete: Cascade)
  relatedCampaign     Campaign?          @relation(fields: [relatedCampaignId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([brandId])
  @@index([relatedCampaignId])
  @@index([createdAt])
}

model MarketIntelligenceRun {
  id             String                   @id @default(cuid())
  organizationId String
  brandId        String
  status         MarketIntelligenceStatus @default(QUEUED)
  error          String?
  createdAt      DateTime                 @default(now())
  updatedAt      DateTime                 @updatedAt

  organization   Organization             @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  brand          Brand                    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([brandId])
}

enum MarketInsightType {
  TREND
  INDUSTRY_SIGNAL
  COMPETITOR_MOVEMENT
  AUDIENCE_SIGNAL
  OPPORTUNITY
  RISK
  CONTENT_OPPORTUNITY
}

enum InsightConfidence {
  HIGH
  MEDIUM
  LOW
}

enum MarketIntelligenceStatus {
  QUEUED
  ANALYZING
  COMPLETED
  FAILED
  NOT_CONFIGURED
}
`;

  schema = schema.trim() + '\n' + newModelsAndEnums;
  fs.writeFileSync(schemaPath, schema, 'utf-8');
  console.log('schema.prisma updated successfully!');
}

main().catch(console.error);
