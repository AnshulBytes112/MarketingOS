import { z } from 'zod';

export const ContentItemGenerationSchema = z.object({
  title: z.string().describe('The title or hook of the content piece.'),
  platform: z.string().describe('The social media platform for this content (e.g. LinkedIn, Twitter, Instagram).'),
  format: z.string().describe('The format of the content (e.g. Text Post, Image, Video, Carousel).'),
  scheduledDate: z.string().describe('The scheduled publication date in YYYY-MM-DD format. Must be within the current month.'),
  funnelStage: z.string().describe('The marketing funnel stage: TOFU, MOFU, or BOFU.'),
  contentPillar: z.string().describe('The primary content pillar this post aligns with.'),
  theme: z.string().optional().describe('An optional specific theme or topic for the post.'),
});

export const ContentPlanGenerationSchema = z.object({
  items: z.array(ContentItemGenerationSchema).describe('An exact list of 14 content items for the 14-day calendar.'),
});
