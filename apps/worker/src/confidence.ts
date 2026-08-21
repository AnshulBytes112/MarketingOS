import { z } from 'zod';
import { BrandDNASourceSchema } from './brand-dna.schema';

export type BrandDNASource = z.infer<typeof BrandDNASourceSchema>;

interface ConfidenceInput {
  brand: {
    industry?: string | null;
    targetAudience?: string | null;
    positioning?: string | null;
    usp?: string | null;
  };
  products: { name: string }[];
  competitors: { name: string }[];
  assets: { extractionStatus?: string | null; extractedText?: string | null; fileName?: string | null; id: string }[];
}

interface ConfidenceResult {
  confidenceScore: number;
  sources: BrandDNASource[];
  extractedTextData: string;
}

/**
 * Calculates deterministic "Brand Evidence Confidence" score based on the completeness of ingested data.
 * 
 * Rules:
 * - Baseline score starts at 50%.
 * - Onboarding fields (industry, targetAudience, positioning, usp) contribute.
 * - Product catalog contributes 10% if at least 1 product exists.
 * - Competitor list contributes 5% if at least 1 competitor exists.
 * - Each fully extracted PDF asset contributes 10%.
 * - Maximum score is capped at 98%.
 */
export function calculateBrandEvidenceConfidence(input: ConfidenceInput): ConfidenceResult {
  let confidenceScore = 50; // Base score
  const sources: BrandDNASource[] = [];

  sources.push({ type: 'ONBOARDING', label: 'Brand onboarding' });
  if (input.brand.industry) { confidenceScore += 5; }
  if (input.brand.targetAudience) { confidenceScore += 10; }
  if (input.brand.positioning) { confidenceScore += 10; }
  if (input.brand.usp) { confidenceScore += 10; }
  
  if (input.products.length > 0) {
    confidenceScore += 10;
    sources.push({ type: 'PRODUCTS', label: `Product/service catalog (${input.products.length} items)` });
  }
  
  if (input.competitors.length > 0) {
    confidenceScore += 5;
    sources.push({ type: 'COMPETITORS', label: `${input.competitors.length} named competitors` });
  }

  let extractedTextData = '';
  input.assets.forEach(asset => {
    if (asset.extractionStatus === 'COMPLETED' && asset.extractedText) {
      confidenceScore += 10;
      sources.push({ type: 'ASSET', label: asset.fileName || 'Extracted Document', assetId: asset.id });
      extractedTextData += `\n--- Document: ${asset.fileName || 'Unknown'} ---\n${asset.extractedText}\n`;
    }
  });

  confidenceScore = Math.min(confidenceScore, 98); // Cap at 98%

  return {
    confidenceScore,
    sources,
    extractedTextData
  };
}
