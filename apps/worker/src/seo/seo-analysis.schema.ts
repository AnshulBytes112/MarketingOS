import { z } from 'zod';

export const SEORecommendationSchema = z.object({
  category: z.enum(['TITLE', 'META', 'KEYWORD', 'STRUCTURE', 'INTENT', 'READABILITY', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  explanation: z.string(),
  suggestedAction: z.string(),
});

export const SEOAnalysisOutputSchema = z.object({
  seoScore: z.number().min(0).max(100),
  subScores: z.object({
    keywordRelevance: z.number().min(0).max(100),
    searchIntentAlignment: z.number().min(0).max(100),
    titleQuality: z.number().min(0).max(100),
    readability: z.number().min(0).max(100),
  }),
  searchIntent: z.enum(['INFORMATIONAL', 'NAVIGATIONAL', 'COMMERCIAL', 'TRANSACTIONAL']),
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
