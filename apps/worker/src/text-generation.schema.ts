import { z } from 'zod';

export const TextGenerationSchema = z.object({
  content: z.object({
    hook: z.string().optional().describe('An engaging hook to capture attention (if applicable)'),
    title: z.string().optional().describe('A catchy title (if applicable)'),
    caption: z.string().optional().describe('The main caption or social media body text'),
    body: z.string().optional().describe('Long-form body content (e.g. for articles or LinkedIn)'),
    cta: z.string().optional().describe('Call to Action (CTA) text'),
    hashtags: z.array(z.string()).optional().describe('List of relevant hashtags without the # symbol'),
    script: z.string().optional().describe('Video script or talking points (if applicable)'),
    platformSpecificNotes: z.string().optional().describe('Any formatting or structural notes for the user'),
    seoTitle: z.string().optional().describe('SEO Title for web content'),
    seoDescription: z.string().optional().describe('SEO meta description for web content'),
    creativeBrief: z.object({
      visualConcept: z.string().optional(),
      sceneDescription: z.string().optional(),
      subject: z.string().optional(),
      composition: z.string().optional(),
      mood: z.string().optional(),
      brandElements: z.string().optional(),
      textOverlay: z.string().optional(),
      aspectRatio: z.string().optional(),
      visualInstructions: z.string().optional()
    }).optional().describe('Structured creative brief for downstream image/video generation (only if required by format)')
  })
});
