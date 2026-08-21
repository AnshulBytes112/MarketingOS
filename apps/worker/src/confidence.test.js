"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const confidence_1 = require("./confidence");
(0, vitest_1.describe)('Brand Evidence Confidence Calculator', () => {
    (0, vitest_1.it)('starts at 50 base score with only ONBOARDING source if no fields are present', () => {
        const result = (0, confidence_1.calculateBrandEvidenceConfidence)({
            brand: {},
            products: [],
            competitors: [],
            assets: []
        });
        (0, vitest_1.expect)(result.confidenceScore).toBe(50);
        (0, vitest_1.expect)(result.sources).toEqual([
            { type: 'ONBOARDING', label: 'Brand onboarding' }
        ]);
    });
    (0, vitest_1.it)('increases confidence correctly based on onboarding fields', () => {
        const result = (0, confidence_1.calculateBrandEvidenceConfidence)({
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
        (0, vitest_1.expect)(result.confidenceScore).toBe(85);
    });
    (0, vitest_1.it)('caps at 98% even with massive evidence', () => {
        const result = (0, confidence_1.calculateBrandEvidenceConfidence)({
            brand: { industry: 'T', targetAudience: 'T', positioning: 'T', usp: 'T' },
            products: [{ name: 'A' }], // +10 (total 95)
            competitors: [{ name: 'A' }], // +5 (total 100) -> cap 98
            assets: [
                { id: '1', extractionStatus: 'COMPLETED', extractedText: 'yes' }, // +10
                { id: '2', extractionStatus: 'COMPLETED', extractedText: 'yes' } // +10
            ]
        });
        (0, vitest_1.expect)(result.confidenceScore).toBe(98);
    });
    (0, vitest_1.it)('structures sources correctly including ASSET ids', () => {
        const result = (0, confidence_1.calculateBrandEvidenceConfidence)({
            brand: {},
            products: [{ name: 'A' }],
            competitors: [{ name: 'C1' }, { name: 'C2' }],
            assets: [
                { id: 'asset-1', fileName: 'guide.pdf', extractionStatus: 'COMPLETED', extractedText: 'text' }
            ]
        });
        (0, vitest_1.expect)(result.sources).toContainEqual({ type: 'PRODUCTS', label: 'Product/service catalog (1 items)' });
        (0, vitest_1.expect)(result.sources).toContainEqual({ type: 'COMPETITORS', label: '2 named competitors' });
        (0, vitest_1.expect)(result.sources).toContainEqual({ type: 'ASSET', label: 'guide.pdf', assetId: 'asset-1' });
    });
    (0, vitest_1.it)('ignores incomplete assets', () => {
        const result = (0, confidence_1.calculateBrandEvidenceConfidence)({
            brand: {},
            products: [],
            competitors: [],
            assets: [
                { id: 'asset-1', fileName: 'guide.pdf', extractionStatus: 'FAILED', extractedText: null }
            ]
        });
        (0, vitest_1.expect)(result.sources.find(s => s.type === 'ASSET')).toBeUndefined();
        (0, vitest_1.expect)(result.confidenceScore).toBe(50);
    });
});
