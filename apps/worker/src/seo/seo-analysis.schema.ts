import { z } from 'zod';

const categoryEnum = z.enum(['TITLE', 'META', 'KEYWORD', 'STRUCTURE', 'INTENT', 'READABILITY', 'OTHER']);
const categoryPreprocess = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const lower = val.toLowerCase();
  if (lower.includes('title') || lower.includes('hook')) return 'TITLE';
  if (lower.includes('meta') || lower.includes('hashtag') || lower.includes('discoverability') || lower.includes('platform')) return 'META';
  if (lower.includes('keyword') || lower.includes('entity') || lower.includes('stuffing') || lower.includes('enrichment')) return 'KEYWORD';
  if (lower.includes('structure') || lower.includes('layout') || lower.includes('format')) return 'STRUCTURE';
  if (lower.includes('intent') || lower.includes('goal')) return 'INTENT';
  if (lower.includes('readability') || lower.includes('text') || lower.includes('ocr')) return 'READABILITY';
  return 'OTHER';
}, categoryEnum);

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const severityPreprocess = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const upper = val.toUpperCase().trim();
  if (['LOW', 'MEDIUM', 'HIGH'].includes(upper)) return upper;
  return 'MEDIUM';
}, severityEnum);

export const SEORecommendationSchema = z.object({
  category: categoryPreprocess,
  severity: severityPreprocess,
  explanation: z.string(),
  suggestedAction: z.string(),
});

const searchIntentEnum = z.enum(['INFORMATIONAL', 'NAVIGATIONAL', 'COMMERCIAL', 'TRANSACTIONAL']);
const searchIntentPreprocess = z.preprocess((val) => {
  if (typeof val !== 'string') return val;
  const lower = val.toLowerCase();
  if (lower.includes('transaction')) return 'TRANSACTIONAL';
  if (lower.includes('commercial')) return 'COMMERCIAL';
  if (lower.includes('navigation')) return 'NAVIGATIONAL';
  if (lower.includes('information')) return 'INFORMATIONAL';
  return 'INFORMATIONAL';
}, searchIntentEnum);

export const SEOAnalysisOutputSchema = z.object({
  seoScore: z.number().min(0).max(100),
  subScores: z.object({
    keywordRelevance: z.number().min(0).max(100),
    searchIntentAlignment: z.number().min(0).max(100),
    titleQuality: z.number().min(0).max(100),
    readability: z.number().min(0).max(100),
  }),
  searchIntent: searchIntentPreprocess,
  keywordData: z.object({
    primaryThemes: z.array(z.string()),
    missingEntities: z.array(z.string()),
    stuffedKeywords: z.array(z.string()).optional(),
  }),
  flags: z.array(z.string()).optional(),
  recommendations: z.array(SEORecommendationSchema),
});

export type SEOAnalysisOutput = z.infer<typeof SEOAnalysisOutputSchema>;
export type SEORecommendation = z.infer<typeof SEORecommendationSchema>;
