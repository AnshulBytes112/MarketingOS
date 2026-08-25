import { z } from 'zod';

export const createCompetitorSchema = z.object({
  name: z.string().trim().min(1, 'Competitor name is required'),
  websiteUrl: z.string().trim().url('Invalid website URL').or(z.literal('')),
  instagram: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('instagram.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?(\?.*)?$/.test(val);
    }
    return /^@?[a-zA-Z0-9._]{1,30}$/.test(val);
  }, 'Invalid Instagram username or URL format'),
  facebook: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('facebook.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9._-]{5,50}\/?$/.test(val);
    }
    return /^@?[a-zA-Z0-9._-]{5,50}$/.test(val);
  }, 'Invalid Facebook username or URL format'),
  linkedin: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('linkedin.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in|showcase)\/[a-zA-Z0-9._-]{3,100}\/?$/.test(val);
    }
    return /^@?[a-zA-Z0-9._-]{3,100}$/.test(val);
  }, 'Invalid LinkedIn handle or URL format'),
  twitter: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('twitter.com/') || val.includes('x.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]{1,15}\/?(\?.*)?$/.test(val);
    }
    return /^@?[a-zA-Z0-9_]{1,15}$/.test(val);
  }, 'Invalid X/Twitter username or URL format'),
  youtube: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('youtube.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)?[a-zA-Z0-9_.-]{3,30}\/?$/.test(val);
    }
    return /^@?[a-zA-Z0-9_.-]{3,30}$/.test(val);
  }, 'Invalid YouTube handle or URL format'),
  tiktok: z.string().trim().optional().refine((val) => {
    if (!val) return true;
    const isUrl = val.includes('tiktok.com/');
    if (isUrl) {
      return /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]{2,24}\/?$/.test(val);
    }
    return /^@?[a-zA-Z0-9_.-]{2,24}$/.test(val);
  }, 'Invalid TikTok username or URL format'),
});

export const updateCompetitorSchema = createCompetitorSchema;
