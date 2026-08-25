import { z } from 'zod';

export const ContentItemGenerationSchema = z.object({
  title: z.string(),
  platform: z.string(),
  format: z.string(),
  scheduledDate: z.string(), // Date string YYYY-MM-DD
  funnelStage: z.string(),
  contentPillar: z.string(),
  theme: z.string().optional(),
});

export const ContentPlanGenerationSchema = z.object({
  items: z.array(ContentItemGenerationSchema),
});
