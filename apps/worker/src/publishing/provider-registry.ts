export interface PublishingProvider {
  validate(contentItem: any, contentVersion: any, contentChannel: any, generatedAssets: any[]): Promise<{ valid: boolean; error?: string }>;
  publish(contentItem: any, contentVersion: any, contentChannel: any, generatedAssets: any[]): Promise<{ success: boolean; externalPostId?: string; externalUrl?: string; error?: string; status: 'PUBLISHED' | 'FAILED' }>;
  schedule?(contentItem: any, contentVersion: any, contentChannel: any, generatedAssets: any[], scheduledAt: Date): Promise<{ success: boolean; externalPostId?: string; error?: string }>;
  cancel?(externalPostId: string): Promise<boolean>;
}

export class StubProvider implements PublishingProvider {
  async validate(contentItem: any, contentVersion: any, contentChannel: any, generatedAssets: any[]) {
    return { valid: true };
  }

  async publish(contentItem: any, contentVersion: any, contentChannel: any, generatedAssets: any[]) {
    // Stub provider never simulates fake success. It always returns a structured error representing a missing integration.
    return {
      success: false,
      status: 'FAILED' as const,
      error: 'NOT_CONFIGURED',
    };
  }
}

export const providerRegistry = {
  providers: new Map<string, PublishingProvider>(),
  
  register(name: string, provider: PublishingProvider) {
    this.providers.set(name, provider);
  },

  get(name: string): PublishingProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      // Fallback to stub provider if not configured, rather than crashing the worker
      return new StubProvider();
    }
    return provider;
  }
};

// Register default stub providers for known platforms so they return NOT_CONFIGURED instead of failing lookup
providerRegistry.register('INSTAGRAM', new StubProvider());
providerRegistry.register('LINKEDIN', new StubProvider());
providerRegistry.register('FACEBOOK', new StubProvider());
providerRegistry.register('X', new StubProvider());
providerRegistry.register('WEBSITE', new StubProvider());
