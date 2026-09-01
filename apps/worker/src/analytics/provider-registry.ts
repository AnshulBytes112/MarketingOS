export interface AnalyticsProvider {
  validate(contentChannel: any): Promise<{ valid: boolean; error?: string }>;
  fetchPostMetrics(externalPostId: string, contentChannel: any): Promise<{
    success: boolean;
    metrics?: {
      reach?: number | null;
      impressions?: number | null;
      likes?: number | null;
      comments?: number | null;
      shares?: number | null;
      saves?: number | null;
      clicks?: number | null;
      videoViews?: number | null;
      watchTime?: number | null;
    };
    rawMetrics?: any;
    error?: string;
  }>;
  fetchChannelMetrics?(contentChannel: any): Promise<{
    success: boolean;
    metrics?: {
      followersGained?: number | null;
      followersLost?: number | null;
    };
    rawMetrics?: any;
    error?: string;
  }>;
}

export class StubAnalyticsProvider implements AnalyticsProvider {
  async validate(contentChannel: any) {
    return { valid: false, error: 'NOT_CONFIGURED' };
  }

  async fetchPostMetrics(externalPostId: string, contentChannel: any) {
    // Stub provider never simulates fake success. It always returns a structured error representing a missing integration.
    return {
      success: false,
      error: 'NOT_CONFIGURED',
    };
  }

  async fetchChannelMetrics(contentChannel: any) {
    return {
      success: false,
      error: 'NOT_CONFIGURED',
    };
  }
}

export const analyticsProviderRegistry = {
  providers: new Map<string, AnalyticsProvider>(),
  
  register(name: string, provider: AnalyticsProvider) {
    this.providers.set(name, provider);
  },

  get(name: string): AnalyticsProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      // Fallback to stub provider if not configured, rather than crashing the worker
      return new StubAnalyticsProvider();
    }
    return provider;
  }
};

// Register default stub providers for known platforms so they return NOT_CONFIGURED instead of failing lookup
analyticsProviderRegistry.register('INSTAGRAM', new StubAnalyticsProvider());
analyticsProviderRegistry.register('LINKEDIN', new StubAnalyticsProvider());
analyticsProviderRegistry.register('FACEBOOK', new StubAnalyticsProvider());
analyticsProviderRegistry.register('X', new StubAnalyticsProvider());
analyticsProviderRegistry.register('WEBSITE', new StubAnalyticsProvider());
