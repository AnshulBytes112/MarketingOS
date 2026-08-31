import { prisma } from '@abge/database';

export interface CompiledMarketContext {
  contextString: string;
  brandDnaVersionId?: string;
  strategyId?: string;
  competitorIds: string[];
}

export class MarketIntelligenceContextBuilder {
  static async build(brandId: string, organizationId: string): Promise<CompiledMarketContext> {
    // 1. Fetch Brand DNA
    const activeDna = await prisma.brandDNAVersion.findFirst({
      where: {
        brandId,
        organizationId,
        publicationStatus: 'ACTIVE',
        status: 'COMPLETED',
      },
      include: {
        brand: true,
      },
      orderBy: { version: 'desc' },
    });

    // 2. Fetch Active Strategy
    const activeStrategy = await prisma.strategy.findFirst({
      where: {
        brandId,
        organizationId,
        publicationStatus: 'ACTIVE',
        status: 'COMPLETED',
      },
      orderBy: { version: 'desc' },
    });

    // 3. Fetch Competitors
    const competitors = await prisma.brandCompetitor.findMany({
      where: { brandId, organizationId },
      take: 10,
    });
    const competitorIds = competitors.map((c) => c.id);

    // 4. Fetch Recent Competitor Posts
    const competitorPosts = await prisma.competitorPost.findMany({
      where: {
        brandId,
        organizationId,
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      include: {
        competitor: true,
      },
    });

    // 5. Fetch Recent Content Performance (Snapshots)
    const metricSnapshots = await prisma.contentMetricSnapshot.findMany({
      where: {
        brandId,
        organizationId,
      },
      orderBy: { metricDate: 'desc' },
      take: 10,
      include: {
        contentItem: true,
      },
    });

    // 6. Fetch Recent SEO Analyses
    const seoAnalyses = await prisma.sEOAnalysis.findMany({
      where: {
        brandId,
        organizationId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Build token-efficient context string
    let ctx = 'MARKET INTELLIGENCE INPUT SIGNALS:\n\n';

    if (activeDna) {
      ctx += `--- BRAND DNA (Version: ${activeDna.version}) ---\n`;
      ctx += `Brand Name: ${activeDna.brand?.name || 'N/A'}\n`;
      ctx += `Tone/Voice: ${activeDna.tone || 'N/A'} - ${activeDna.voice || 'N/A'}\n`;
      ctx += `Personality: ${activeDna.personality || 'N/A'}\n`;
      ctx += `Positioning: ${activeDna.positioning || 'N/A'}\n`;
      ctx += `Target Audience: ${activeDna.audience || 'N/A'}\n\n`;
    }

    if (activeStrategy) {
      ctx += `--- STRATEGIC GOALS (Version: ${activeStrategy.version}) ---\n`;
      ctx += `Goal Summary: ${JSON.stringify(activeStrategy.goal || {})}\n`;
      ctx += `Content Pillars: ${JSON.stringify(activeStrategy.contentPillars || [])}\n\n`;
    }

    if (competitors.length > 0) {
      ctx += `--- TRACKED COMPETITORS ---\n`;
      competitors.forEach((c) => {
        ctx += `- ${c.name} (${c.websiteUrl || 'No Website'})\n`;
      });
      ctx += '\n';
    }

    if (competitorPosts.length > 0) {
      ctx += `--- RECENT COMPETITOR ACTIVITY ---\n`;
      competitorPosts.forEach((post) => {
        ctx += `[${post.competitor.name}] Platform: ${post.platform} | Engagement: Likes: ${post.likeCount || 0}, Comments: ${post.commentCount || 0}\n`;
        if (post.captionText) {
          ctx += `Caption: ${post.captionText.substring(0, 150)}...\n`;
        }
      });
      ctx += '\n';
    }

    if (metricSnapshots.length > 0) {
      ctx += `--- OWN RECENT CONTENT PERFORMANCE ---\n`;
      metricSnapshots.forEach((snap) => {
        ctx += `[Post: ${snap.contentItem.title}] Platform: ${snap.platform} | Likes: ${snap.likes || 0}, Views: ${snap.videoViews || 0}, Engagement Rate: ${snap.engagementRate || 0}%\n`;
      });
      ctx += '\n';
    }

    if (seoAnalyses.length > 0) {
      ctx += `--- RECENT SEO ANALYSES ---\n`;
      seoAnalyses.forEach((seo) => {
        ctx += `- Keyword/Topic: ${seo.searchIntent || 'N/A'} | Score: ${seo.seoScore || 0}\n`;
      });
      ctx += '\n';
    }

    return {
      contextString: ctx,
      brandDnaVersionId: activeDna?.id,
      strategyId: activeStrategy?.id,
      competitorIds,
    };
  }
}
