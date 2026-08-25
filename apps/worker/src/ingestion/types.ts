export type ProviderState = 
  | 'AVAILABLE' 
  | 'UNAVAILABLE' 
  | 'AUTH_REQUIRED' 
  | 'RATE_LIMITED' 
  | 'BLOCKED' 
  | 'UNSUPPORTED';

export interface IngestedAccount {
  platform: string;
  handle: string;
  displayName?: string | null;
  bio?: string | null;
  followerCount?: number | null;
  followingCount?: number | null;
  postCount?: number | null;
  profileUrl?: string | null;
}

export interface IngestedPost {
  externalPostId?: string | null;
  url?: string | null;
  publishedAt: Date;
  captionText?: string | null;
  mediaType?: string | null;
  likeCount?: number | null;
  commentCount?: number | null;
  shareCount?: number | null;
  viewCount?: number | null;
  rawMetadata?: any;
}

export interface CompetitorIngestionProvider {
  getPlatform(): string;
  getState(): ProviderState;
  fetchAccount(handle: string): Promise<IngestedAccount>;
  fetchRecentPosts(handle: string): Promise<IngestedPost[]>;
}
