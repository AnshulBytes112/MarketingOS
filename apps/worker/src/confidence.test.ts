import { describe, it, expect } from 'vitest';
import { calculateBrandEvidenceConfidence } from './confidence';

describe('Brand Evidence Confidence Calculator', () => {
  it('starts at 50 base score with only ONBOARDING source if no fields are present', () => {
    const result = calculateBrandEvidenceConfidence({
      brand: {},
      products: [],
      competitors: [],
      assets: []
    });

    expect(result.confidenceScore).toBe(50);
    expect(result.sources).toEqual([
      { type: 'ONBOARDING', label: 'Brand onboarding' }
    ]);
  });

  it('increases confidence correctly based on onboarding fields', () => {
    const result = calculateBrandEvidenceConfidence({
      brand: {
        industry: 'Tech',
        targetAudience: 'Devs',
        positioning: 'Best',
        usp: 'Fast'
      },
      products: [],
      competitors: [],
      assets: []
    });

    // 50 + 5 + 10 + 10 + 10 = 85
    expect(result.confidenceScore).toBe(85);
  });

  it('caps at 98% even with massive evidence', () => {
    const result = calculateBrandEvidenceConfidence({
      brand: { industry: 'T', targetAudience: 'T', positioning: 'T', usp: 'T' },
      products: [{ name: 'A' }], // +10 (total 95)
      competitors: [{ name: 'A' }], // +5 (total 100) -> cap 98
      assets: [
        { id: '1', extractionStatus: 'COMPLETED', extractedText: 'yes' }, // +10
        { id: '2', extractionStatus: 'COMPLETED', extractedText: 'yes' }  // +10
      ]
    });

    expect(result.confidenceScore).toBe(98);
  });

  it('structures sources correctly including ASSET ids', () => {
    const result = calculateBrandEvidenceConfidence({
      brand: {},
      products: [{ name: 'A' }],
      competitors: [{ name: 'C1' }, { name: 'C2' }],
      assets: [
        { id: 'asset-1', fileName: 'guide.pdf', extractionStatus: 'COMPLETED', extractedText: 'text' }
      ]
    });

    expect(result.sources).toContainEqual({ type: 'PRODUCTS', label: 'Product/service catalog (1 items)' });
    expect(result.sources).toContainEqual({ type: 'COMPETITORS', label: '2 named competitors' });
    expect(result.sources).toContainEqual({ type: 'ASSET', label: 'guide.pdf', assetId: 'asset-1' });
  });

  it('ignores incomplete assets', () => {
    const result = calculateBrandEvidenceConfidence({
      brand: {},
      products: [],
      competitors: [],
      assets: [
        { id: 'asset-1', fileName: 'guide.pdf', extractionStatus: 'FAILED', extractedText: null }
      ]
    });

    expect(result.sources.find(s => s.type === 'ASSET')).toBeUndefined();
    expect(result.confidenceScore).toBe(50);
  });
});
