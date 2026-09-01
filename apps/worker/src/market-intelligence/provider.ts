export interface RawMarketInsight {
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  observedAt: Date;
  data?: any;
}

export interface RawMarketData {
  trends: RawMarketInsight[];
  competitorSignals: RawMarketInsight[];
  industrySignals: RawMarketInsight[];
  audienceSignals: RawMarketInsight[];
}

export interface MarketIntelligenceProvider {
  validate(): Promise<boolean>;
  fetchInsights(brandContext: string): Promise<RawMarketData>;
}

export class StubMarketIntelligenceProvider implements MarketIntelligenceProvider {
  async validate(): Promise<boolean> {
    return process.env.MARKET_INTEL_PROVIDER_ENABLED !== 'false';
  }

  async fetchInsights(brandContext: string): Promise<RawMarketData> {
    if (process.env.MARKET_INTEL_PROVIDER_ENABLED === 'false') {
      return {
        trends: [],
        competitorSignals: [],
        industrySignals: [],
        audienceSignals: [],
      };
    }

    // For testing/evaluation when enabled, return realistic external mock signals
    return {
      trends: [
        {
          title: "Rise of AI-Driven Interactive Ordering",
          summary: "Search interest in voice-activated and AI-guided table ordering tools has increased by 150% in the restaurant sector.",
          source: "Google Trends",
          sourceUrl: "https://trends.google.com",
          observedAt: new Date()
        }
      ],
      competitorSignals: [
        {
          title: "Competitor X Launching Automated GST Billing feature",
          summary: "Main competitor launched a video campaign demonstrating automatic GST e-invoicing integration on their POS app.",
          source: "Competitor Social Feed",
          observedAt: new Date()
        }
      ],
      industrySignals: [
        {
          title: "GST Compliance Mandate for Medium-sized Eateries",
          summary: "New tax regulations require real-time reporting of restaurant sales for billing systems.",
          source: "National Tax Authority Portal",
          observedAt: new Date()
        }
      ],
      audienceSignals: [
        {
          title: "Customers Complaining About Manual KOT Errors",
          summary: "Aggregated online review signals indicate high customer frustration with wait times due to manual kitchen order tickets.",
          source: "Eatery Feedback Index",
          observedAt: new Date()
        }
      ]
    };
  }
}
