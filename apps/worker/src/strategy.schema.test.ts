import { describe, it, expect } from 'vitest';
import { NewStrategySchema } from './strategy.schema';

describe('NewStrategySchema Validation', () => {
  it('should accept a valid fully populated strategy', () => {
    const validData = {
      goal: {
        primaryGoal: "Increase revenue",
        measurableObjective: "Increase MRR by 20%",
        successMetrics: ["MRR", "Churn rate"],
        baseline: "100k MRR",
        target: "20%",
        timeframe: "Q3",
        leadingIndicators: ["Signups", "Demo requests"],
        businessOutcome: "Higher profitability"
      },
      audienceSegments: {
        primarySegment: "Tech founders",
        secondarySegments: ["Marketing managers"],
        segmentNeeds: ["Automation", "Insights"],
        painPoints: ["Manual work"],
        motivations: ["Scale faster"],
        demographics: "25-45, high income",
        jobToBeDone: "Save time on marketing"
      },
      contentPillars: [
        {
          name: "Education",
          description: "Teach users how to use the product",
          objective: "Increase adoption",
          recommendedWeight: 60,
          priority: "HIGH",
          expectedOutcome: "Less support tickets",
          targetFunnelStages: ["TOFU", "MOFU"]
        },
        {
          name: "Inspiration",
          description: "Show success stories",
          objective: "Drive conversion",
          recommendedWeight: 40,
          priority: "MEDIUM",
          expectedOutcome: "More sales",
          targetFunnelStages: ["BOFU"]
        }
      ],
      contentMix: [
        {
          category: "Tutorials",
          percentage: 60,
          rationale: "Users need help",
          expectedOutcome: "Higher activation",
          funnelStage: "MOFU"
        },
        {
          category: "Case Studies",
          percentage: 40,
          rationale: "Social proof",
          expectedOutcome: "Higher conversion",
          funnelStage: "BOFU"
        }
      ],
      funnelMapping: {
        TOFU: {
          objective: "Awareness",
          contentTypes: ["Blog", "Shorts"],
          recommendedAllocation: 40,
          audienceIntent: "Learning",
          desiredNextAction: "Subscribe",
          recommendedCTA: "Read more"
        },
        MOFU: {
          objective: "Consideration",
          contentTypes: ["Webinar"],
          recommendedAllocation: 40,
          audienceIntent: "Evaluating",
          desiredNextAction: "Book demo",
          recommendedCTA: "Watch now"
        },
        BOFU: {
          objective: "Conversion",
          contentTypes: ["Case Study"],
          recommendedAllocation: 20,
          audienceIntent: "Buying",
          desiredNextAction: "Purchase",
          recommendedCTA: "Buy now"
        }
      },
      platformStrategy: [
        {
          platform: "LinkedIn",
          objective: "B2B leads",
          audienceFit: "Perfect",
          formats: ["Text", "Carousel"],
          allocation: 100,
          cadence: "3x/week",
          rationale: "Where our audience is",
          role: "Primary",
          primaryKPI: "Leads"
        }
      ],
      formats: [
        {
          name: "Text Posts",
          description: "Thought leadership"
        }
      ],
      cadence: [
        {
          platform: "LinkedIn",
          cadence: "3x/week"
        }
      ],
      themes: [
        {
          name: "Future of Work",
          explanation: "AI automation trends",
          strategicPurpose: "Thought leadership",
          relatedPillar: "Education",
          funnelStages: ["TOFU"]
        }
      ],
      campaignOpportunities: [
        {
          name: "Q3 Launch",
          objective: "Drive signups",
          audience: "Founders",
          funnelStage: "MOFU",
          suggestedPlatforms: ["LinkedIn"],
          suggestedFormats: ["Video"],
          rationale: "New feature",
          duration: "4 weeks",
          cta: "Sign up today",
          successMetric: "1000 signups",
          relatedContentPillars: ["Inspiration"]
        }
      ],
      reasoning: [
        {
          section: "Platform",
          observation: "LinkedIn works",
          evidence: "Competitor data",
          reasoning: "Because B2B",
          recommendation: "Double down on LinkedIn",
          implication: "Need more writers",
          decision: "Allocate 100% budget to LinkedIn",
          sources: ["comp-1"]
        }
      ],
      sources: [
        {
          type: "COMPETITOR",
          id: "comp-1",
          label: "Competitor A"
        }
      ],
      dataLimitations: {
        historicalPerformance: "UNAVAILABLE",
        competitorData: "WEBSITE_ONLY",
        audienceData: "VALIDATED",
        notes: ["Some data is missing"]
      },
      experiments: [
        {
          hypothesis: "Video beats text",
          test: "Format A/B test",
          variable: "Format",
          primaryMetric: "CTR",
          successThreshold: "10% improvement",
          duration: "2 weeks",
          expectedInsight: "Whether to invest in video"
        }
      ]
    };

    const result = NewStrategySchema.safeParse(validData);
    if (!result.success) {
      console.error(result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it('should reject missing strict fields', () => {
    const invalidData = {
      goal: {
        primaryGoal: "Increase revenue"
      }
      // Missing everything else
    };

    const result = NewStrategySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject 0% platform allocation without Not recommended role', () => {
    const invalidData = {
      // populate with partial valid data...
      platformStrategy: [
        {
          platform: "Twitter",
          objective: "None",
          audienceFit: "Poor",
          formats: [],
          allocation: 0,
          cadence: "Never",
          role: "Primary", // Invalid role for 0%
          primaryKPI: "None"
        }
      ]
    };

    const result = NewStrategySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const platformError = result.error.issues.find(i => i.path[0] === 'platformStrategy');
      expect(platformError).toBeDefined();
    }
  });
});
