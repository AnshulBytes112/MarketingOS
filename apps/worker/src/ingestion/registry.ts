import { CompetitorIngestionProvider } from './types';
import { GenericWebsiteProvider } from './website';
import { InstagramProvider, LinkedInProvider, TwitterProvider, TikTokProvider, YouTubeProvider } from './social';

const providers: Record<string, CompetitorIngestionProvider> = {
  website: new GenericWebsiteProvider(),
  instagram: new InstagramProvider(),
  linkedin: new LinkedInProvider(),
  twitter: new TwitterProvider(),
  tiktok: new TikTokProvider(),
  youtube: new YouTubeProvider(),
};

export function getProvider(platform: string): CompetitorIngestionProvider | null {
  const p = providers[platform.toLowerCase()];
  return p || null;
}
