import { z } from 'zod';

export const BrandDNASourceSchema = z.object({
  type: z.enum(["ONBOARDING", "PRODUCTS", "COMPETITORS", "ASSET"]),
  label: z.string(),
  assetId: z.string().optional(),
});

export const BrandDNASourcesSchema = z.array(BrandDNASourceSchema);

export const BrandDNASchema = z.object({
  personality: z.string().describe("Brand personality description (single paragraph or comma-separated string)"),
  voice: z.string().describe("Brand voice description (single string)"),
  tone: z.string().describe("Brand tone description (single string)"),
  positioning: z.string().describe("Positioning statement (single string)"),
  visualIdentitySummary: z.string().describe("Summary of visual identity (single string)"),
  audience: z.string().describe("Primary and secondary audience (single string)"),
  contentPillars: z.array(z.object({
    name: z.string(),
    percentage: z.number(),
    color: z.string(),
    textColor: z.string()
  })).describe("5 content pillars summing to 100%"),
  demographics: z.array(z.object({
    range: z.string(),
    percentage: z.number(),
    color: z.string(),
    textColor: z.string()
  })).describe("Demographic breakdown by age/type summing to 100%"),
  inferredIndustry: z.string().describe("Inferred industry of the brand"),
  inferredGeography: z.string().describe("Inferred primary geography or market"),
  inferredPriceSegment: z.string().describe("Inferred price segment (e.g. Premium, Value)"),
  inferredWebsiteUrl: z.string().describe("Inferred or extracted website URL"),
  language: z.string().describe("Language characteristics"),
  ctaPreferences: z.string().describe("Call to action style"),
  avoidList: z.array(z.string()).describe("List of things to avoid"),
  claims: z.array(z.string()).describe("Verified claims to use"),
  constraints: z.array(z.string()).describe("Hard constraints")
});
