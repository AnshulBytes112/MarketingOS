import { prisma } from '@abge/database';

export interface ContentContextResult {
  context: string;
  sourceIds: string[];
  brandDnaVersionId: string;
  strategyId: string;
  strategyVersion: number;
  contentItemId: string;
  contentChannelId?: string;
}

export interface ContentContextProvider {
  getContext(contentItemId: string, brandId: string, organizationId: string): Promise<ContentContextResult>;
}

export class DirectDatabaseContextProvider implements ContentContextProvider {
  async getContext(contentItemId: string, brandId: string, organizationId: string): Promise<ContentContextResult> {
    const item = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        strategy: true,
        channel: true,
      }
    });

    if (!item || item.organizationId !== organizationId || item.brandId !== brandId) {
      throw new Error('Content item not found or unauthorized');
    }

    if (item.strategy.publicationStatus !== 'ACTIVE' && item.strategy.status !== 'COMPLETED') {
      throw new Error('STRATEGY_NOT_AVAILABLE');
    }

    const activeDna = await prisma.brandDNAVersion.findFirst({
      where: {
        brandId,
        organizationId,
        publicationStatus: 'ACTIVE',
        status: 'COMPLETED',
      },
      orderBy: { version: 'desc' }
    });

    if (!activeDna) {
      throw new Error('No active Brand DNA found');
    }

    // Deterministic relevance selection for sources (BrandAsset)
    // 1. Fetch all assets for the brand that have extracted text
    const assets = await prisma.brandAsset.findMany({
      where: {
        brandId,
        organizationId,
        extractedText: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Simple deterministic scoring
    const scoredAssets = assets.map(asset => {
      let score = 0;
      const text = asset.extractedText?.toLowerCase() || '';
      const topic = item.title.toLowerCase();
      const pillar = item.contentPillar.toLowerCase();
      
      // Topic relevance
      if (topic && text.includes(topic)) score += 10;
      // Pillar relevance
      if (pillar && text.includes(pillar)) score += 5;
      
      return { asset, score };
    });

    // Sort by score desc, then recency
    scoredAssets.sort((a, b) => b.score - a.score || b.asset.createdAt.getTime() - a.asset.createdAt.getTime());
    
    // Select top 5
    const topAssets = scoredAssets.slice(0, 5).map(sa => sa.asset);
    const sourceIds = topAssets.map(a => a.id);

    // Build context string
    let contextStr = `BRAND CONTEXT:\nBrand DNA Version: ${activeDna.version}\nDNA: ${JSON.stringify(activeDna)}\n\n`;
    contextStr += `STRATEGIC CONTEXT:\nStrategy Version: ${item.strategy.version}\nStrategy Outline: ${JSON.stringify(item.strategy)}\n`;
    contextStr += `Content Pillar: ${item.contentPillar}\nFunnel Stage: ${item.funnelStage}\n\n`;
    
    if (topAssets.length > 0) {
      contextStr += `SOURCES (Facts and Reference Material):\n`;
      topAssets.forEach((asset, idx) => {
        contextStr += `--- Source ${idx + 1} (${asset.type}) ---\n${asset.extractedText?.substring(0, 1000)}\n`;
      });
      contextStr += `\n`;
    }

    contextStr += `DESTINATION CONTEXT:\nPlatform: ${item.platform}\nFormat: ${item.format}\n`;
    if (item.channel) {
      contextStr += `Channel Details: ${JSON.stringify(item.channel)}\n`;
    }

    return {
      context: contextStr,
      sourceIds,
      brandDnaVersionId: activeDna.id,
      strategyId: item.strategy.id,
      strategyVersion: item.strategy.version,
      contentItemId: item.id,
      contentChannelId: item.channel?.id
    };
  }
}
