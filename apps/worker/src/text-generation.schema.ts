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
  })
});
