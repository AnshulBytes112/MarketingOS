import { z } from 'zod';

// ── Helper: normalize source type string to enum value ──────────────────────
function normalizeSourceType(raw: string): string {
  const upper = (raw ?? '').toUpperCase().replace(/[\s\-]/g, '_');
  if (upper.includes('BRAND_DNA') || upper === 'BRAND_DNA') return 'BRAND_DNA';
  if (upper.includes('ONBOARDING')) return 'ONBOARDING';
  if (upper.includes('BRAND_PRODUCT') || upper.includes('PRODUCT')) return 'BRAND_PRODUCT';
  if (upper.includes('COMPETITOR_ACCOUNT')) return 'COMPETITOR_ACCOUNT';
  if (upper.includes('COMPETITOR_POST')) return 'COMPETITOR_POST';
  if (upper.includes('AI_RECOMMENDATION') || upper.includes('RECOMMENDATION') || upper.includes('AI')) return 'AI_RECOMMENDATION';
  return 'BRAND_DNA'; // Safe fallback
}

// ── Helper: normalize cadence (object OR array) to array ────────────────────
function normalizeCadence(raw: any): Array<{ platform: string; cadence: string }> {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([platform, cadence]) => ({
      platform,
      cadence: String(cadence),
    }));
  }
  return [];
}

// ── Helper: normalize funnel stage ──────────────────────────────────────────
function normalizeStage(raw: any): any {
  if (!raw || typeof raw !== 'object') return {};
  return {
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? raw.description ?? '',
    contentTypes: raw.contentTypes ?? raw.content_types ?? raw.types ?? raw.formats ?? raw.contentFormats ?? raw.recommendedFormats ?? [],
    recommendedAllocation: raw.recommendedAllocation ?? raw.recommended_allocation ?? raw.allocation ?? raw.percentage ?? raw.percent ?? 33,
    audienceIntent: raw.audienceIntent ?? raw.audience_intent ?? 'Explore options',
    desiredNextAction: raw.desiredNextAction ?? raw.desired_next_action ?? 'Visit page',
    recommendedCTA: raw.recommendedCTA ?? raw.recommended_cta ?? raw.cta ?? 'Learn More',
  };
}

// ============================================================================
// ── STRICT SCHEMA (New Generation Contract) ──────────────────────────────────
// ============================================================================

export const NewStrategyGoalSchema = z.object({
  primaryGoal: z.string(),
  measurableObjective: z.string(),
  successMetrics: z.array(z.string()),
  baseline: z.string(),
  target: z.string(),
  timeframe: z.string(),
  leadingIndicators: z.array(z.string()),
  businessOutcome: z.string(),
});

export const NewStrategyAudienceSchema = z.object({
  primarySegment: z.string(),
  secondarySegments: z.array(z.string()),
  segmentNeeds: z.array(z.string()),
  painPoints: z.array(z.string()),
  motivations: z.array(z.string()),
  demographics: z.string(),
  jobToBeDone: z.string(),
});

export const NewStrategyContentPillarSchema = z.object({
  name: z.string(),
  description: z.string(),
  objective: z.string(),
  recommendedWeight: z.number().min(0).max(100),
  priority: z.preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(['HIGH', 'MEDIUM', 'LOW'])),
  expectedOutcome: z.string(),
  targetFunnelStages: z.array(z.string()),
});

export const NewStrategyContentMixItemSchema = z.object({
  category: z.string(),
  percentage: z.number().min(0).max(100),
  rationale: z.string(),
  expectedOutcome: z.string(),
  funnelStage: z.string(),
});

export const NewStrategyFunnelStageSchema = z.object({
  objective: z.string(),
  contentTypes: z.array(z.string()),
  recommendedAllocation: z.number().min(0).max(100),
  audienceIntent: z.string(),
  desiredNextAction: z.string(),
  recommendedCTA: z.string(),
});

export const NewStrategyFunnelMappingSchema = z.object({
  TOFU: NewStrategyFunnelStageSchema,
  MOFU: NewStrategyFunnelStageSchema,
  BOFU: NewStrategyFunnelStageSchema,
});

export const NewStrategyPlatformItemSchema = z.object({
  platform: z.string(),
  objective: z.string(),
  audienceFit: z.string(),
  formats: z.array(z.string()),
  allocation: z.number().min(0).max(100),
  cadence: z.string(),
  rationale: z.string(),
  role: z.string(),
  primaryKPI: z.string(),
}).refine(p => {
  if (p.allocation === 0) {
    return p.role.toLowerCase().includes('not recommended') || p.objective.toLowerCase().includes('not recommended');
  }
  return p.allocation > 0;
}, {
  message: "Platform allocation must be greater than 0%, or its role must indicate 'Not recommended'"
});

export const NewStrategyFormatItemSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const NewStrategyThemeItemSchema = z.object({
  name: z.string(),
  explanation: z.string(),
  strategicPurpose: z.string(),
  relatedPillar: z.string(),
  funnelStages: z.array(z.string()),
});

export const NewStrategyCampaignOpportunitySchema = z.object({
  name: z.string(),
  objective: z.string(),
  audience: z.string(),
  funnelStage: z.string(),
  suggestedPlatforms: z.array(z.string()),
  suggestedFormats: z.array(z.string()),
  duration: z.string(),
  cta: z.string(),
  successMetric: z.string(),
  rationale: z.string(),
  relatedContentPillars: z.array(z.string()),
});

export const NewStrategyAIReasoningItemSchema = z.object({
  section: z.string(),
  observation: z.string(),
  evidence: z.string(),
  reasoning: z.string(),
  recommendation: z.string(),
  implication: z.string(),
  decision: z.string(),
  sources: z.array(z.string()),
});

export const StrategySourceSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') {
    return { type: 'BRAND_DNA', id: raw, label: 'Source Document' };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    type: normalizeSourceType(raw.type ?? raw.sourceType ?? raw.category ?? ''),
    id: String(raw.id ?? raw.sourceId ?? raw.entityId ?? ''),
    label: String(raw.label ?? raw.name ?? raw.title ?? raw.type ?? ''),
  };
}, z.object({
  type: z.enum(['BRAND_DNA', 'ONBOARDING', 'BRAND_PRODUCT', 'COMPETITOR_ACCOUNT', 'COMPETITOR_POST', 'AI_RECOMMENDATION']),
  id: z.string(),
  label: z.string(),
}));

export const DataLimitationsSchema = z.object({
  historicalPerformance: z.enum(['UNAVAILABLE', 'PARTIAL', 'AVAILABLE']),
  competitorData: z.enum(['UNAVAILABLE', 'WEBSITE_ONLY', 'FULL']),
  audienceData: z.enum(['UNAVAILABLE', 'INFERRED', 'VALIDATED']),
  notes: z.array(z.string()),
});

export const ExperimentSchema = z.object({
  hypothesis: z.string(),
  test: z.string(),
  variable: z.string(),
  primaryMetric: z.string(),
  successThreshold: z.string(),
  duration: z.string(),
});

export const NewStrategySchema = z.object({
  goal: NewStrategyGoalSchema,
  audienceSegments: NewStrategyAudienceSchema,
  contentPillars: z.array(NewStrategyContentPillarSchema),
  contentMix: z.array(NewStrategyContentMixItemSchema),
  funnelMapping: NewStrategyFunnelMappingSchema,
  platformStrategy: z.array(NewStrategyPlatformItemSchema),
  formats: z.array(NewStrategyFormatItemSchema),
  cadence: z.preprocess(normalizeCadence, z.array(z.object({
    platform: z.string(),
    cadence: z.string(),
  }))),
  themes: z.array(NewStrategyThemeItemSchema),
  campaignOpportunities: z.array(NewStrategyCampaignOpportunitySchema),
  reasoning: z.array(NewStrategyAIReasoningItemSchema),
  sources: z.array(StrategySourceSchema),
  dataLimitations: DataLimitationsSchema,
  experiments: z.array(ExperimentSchema),
});


// ============================================================================
// ── LENIENT SCHEMA (Legacy Support & Safely Read Existing Records) ──────────
// ============================================================================

export const StrategyGoalSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') {
    return {
      primaryGoal: raw,
      measurableObjective: raw,
      successMetrics: [],
      baseline: 'Baseline unavailable — analytics data has not yet been connected.',
      target: 'Proposed target based on Brand DNA',
      timeframe: '90 days',
      leadingIndicators: [],
      businessOutcome: 'Growth and visibility',
    };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    primaryGoal: raw.primaryGoal ?? raw.goal ?? raw.primary_goal ?? raw.objective ?? '',
    measurableObjective: raw.measurableObjective ?? raw.measurable_objective ?? raw.kpi ?? raw.metric ?? raw.primaryGoal ?? '',
    successMetrics: raw.successMetrics ?? raw.success_metrics ?? raw.metrics ?? raw.kpis ?? [],
    baseline: raw.baseline ?? 'Baseline unavailable — analytics data has not yet been connected.',
    target: raw.target ?? 'Proposed target based on Brand DNA',
    timeframe: raw.timeframe ?? '90 days',
    leadingIndicators: raw.leadingIndicators ?? [],
    businessOutcome: raw.businessOutcome ?? raw.business_outcome ?? 'Growth and visibility',
  };
}, z.object({
  primaryGoal: z.string(),
  measurableObjective: z.string(),
  successMetrics: z.array(z.string()),
  baseline: z.string().default('Baseline unavailable — analytics data has not yet been connected.'),
  target: z.string().default('Proposed target based on Brand DNA'),
  timeframe: z.string().default('90 days'),
  leadingIndicators: z.array(z.string()).default([]),
  businessOutcome: z.string().default('Growth and visibility'),
}));

export const StrategyAudienceSchema = z.preprocess((raw: any) => {
  if (Array.isArray(raw)) {
    const [first, ...rest] = raw;
    const primary = typeof first === 'string' ? first : (first?.name ?? first?.segment ?? JSON.stringify(first));
    const secondary = rest.map((r: any) => typeof r === 'string' ? r : (r?.name ?? r?.segment ?? JSON.stringify(r)));
    return {
      primarySegment: primary,
      secondarySegments: secondary,
      segmentNeeds: [],
      painPoints: [],
      motivations: [],
      demographics: 'Target demographics',
      jobToBeDone: 'Desired purchase solution',
    };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    primarySegment: raw.primarySegment ?? raw.primary_segment ?? raw.primary ?? raw.mainSegment ?? '',
    secondarySegments: raw.secondarySegments ?? raw.secondary_segments ?? raw.secondary ?? [],
    segmentNeeds: raw.segmentNeeds ?? raw.segment_needs ?? raw.needs ?? raw.requirements ?? [],
    painPoints: raw.painPoints ?? raw.pain_points ?? raw.challenges ?? raw.problems ?? [],
    motivations: raw.motivations ?? raw.drivers ?? raw.goals ?? raw.desires ?? [],
    demographics: raw.demographics ?? 'Target demographics',
    jobToBeDone: raw.jobToBeDone ?? raw.job_to_be_done ?? 'Desired purchase solution',
  };
}, z.object({
  primarySegment: z.string(),
  secondarySegments: z.array(z.string()),
  segmentNeeds: z.array(z.string()),
  painPoints: z.array(z.string()),
  motivations: z.array(z.string()),
  demographics: z.string().default('Target demographics'),
  jobToBeDone: z.string().default('Desired purchase solution'),
}));

export const StrategyContentPillarSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') {
    return {
      name: raw,
      description: raw,
      objective: raw,
      recommendedWeight: 20,
      priority: 'MEDIUM',
      expectedOutcome: 'Increase awareness and engagement',
      targetFunnelStages: ['TOFU'],
    };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.pillar ?? raw.title ?? '',
    description: raw.description ?? raw.details ?? raw.summary ?? raw.name ?? '',
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? '',
    recommendedWeight: raw.recommendedWeight ?? raw.recommended_weight ?? raw.weight ?? raw.percentage ?? raw.allocation ?? 20,
    priority: raw.priority ?? 'MEDIUM',
    expectedOutcome: raw.expectedOutcome ?? raw.expected_outcome ?? 'Increase awareness and engagement',
    targetFunnelStages: raw.targetFunnelStages ?? raw.target_funnel_stages ?? ['TOFU'],
  };
}, z.object({
  name: z.string(),
  description: z.string(),
  objective: z.string(),
  recommendedWeight: z.number().min(0).max(100),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  expectedOutcome: z.string().default('Increase awareness and engagement'),
  targetFunnelStages: z.array(z.string()).default(['TOFU']),
}));

export const StrategyContentMixItemSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    category: raw.category ?? raw.type ?? raw.contentCategory ?? raw.name ?? '',
    percentage: raw.percentage ?? raw.percent ?? raw.allocation ?? raw.weight ?? 0,
    rationale: raw.rationale ?? raw.reasoning ?? raw.description ?? '',
    expectedOutcome: raw.expectedOutcome ?? raw.expected_outcome ?? 'Support user transition through the funnel',
    funnelStage: raw.funnelStage ?? raw.funnel_stage ?? 'TOFU',
  };
}, z.object({
  category: z.string(),
  percentage: z.number().min(0).max(100),
  rationale: z.string(),
  expectedOutcome: z.string().default('Support user transition through the funnel'),
  funnelStage: z.string().default('TOFU'),
}));

export const StrategyFunnelStageSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? '',
    contentTypes: raw.contentTypes ?? raw.content_types ?? raw.types ?? raw.formats ?? raw.contentFormats ?? [],
    recommendedAllocation: raw.recommendedAllocation ?? raw.recommended_allocation ?? raw.allocation ?? raw.percentage ?? raw.percent ?? 33,
    audienceIntent: raw.audienceIntent ?? raw.audience_intent ?? 'Explore options',
    desiredNextAction: raw.desiredNextAction ?? raw.desired_next_action ?? 'Visit page',
    recommendedCTA: raw.recommendedCTA ?? raw.recommended_cta ?? raw.cta ?? 'Learn More',
  };
}, z.object({
  objective: z.string(),
  contentTypes: z.array(z.string()),
  recommendedAllocation: z.number().min(0).max(100),
  audienceIntent: z.string().default('Explore options'),
  desiredNextAction: z.string().default('Visit page'),
  recommendedCTA: z.string().default('Learn More'),
}));

export const StrategyFunnelMappingSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  const tofu = raw.TOFU ?? raw.tofu ?? raw.top_of_funnel ?? raw.topOfFunnel ?? raw.awareness ?? raw['Top of Funnel'] ?? {};
  const mofu = raw.MOFU ?? raw.mofu ?? raw.middle_of_funnel ?? raw.middleOfFunnel ?? raw.consideration ?? raw['Middle of Funnel'] ?? {};
  const bofu = raw.BOFU ?? raw.bofu ?? raw.bottom_of_funnel ?? raw.bottomOfFunnel ?? raw.conversion ?? raw['Bottom of Funnel'] ?? {};
  return {
    TOFU: normalizeStage(tofu),
    MOFU: normalizeStage(mofu),
    BOFU: normalizeStage(bofu),
  };
}, z.object({
  TOFU: StrategyFunnelStageSchema,
  MOFU: StrategyFunnelStageSchema,
  BOFU: StrategyFunnelStageSchema,
}));

export const StrategyPlatformItemSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    platform: raw.platform ?? raw.channel ?? raw.name ?? '',
    objective: raw.objective ?? raw.goal ?? raw.platformObjective ?? '',
    audienceFit: raw.audienceFit ?? raw.audience_fit ?? raw.audienceMatch ?? raw.audience ?? '',
    formats: raw.formats ?? raw.contentFormats ?? raw.recommendedFormats ?? raw.suggestedFormats ?? [],
    allocation: raw.allocation ?? raw.percentage ?? raw.percent ?? raw.weight ?? 0,
    cadence: raw.cadence ?? raw.postingFrequency ?? raw.frequency ?? '',
    rationale: raw.rationale ?? raw.reasoning ?? raw.justification ?? '',
    role: raw.role ?? 'Channel profile',
    primaryKPI: raw.primaryKPI ?? raw.primary_kpi ?? 'Engagement',
  };
}, z.object({
  platform: z.string(),
  objective: z.string(),
  audienceFit: z.string(),
  formats: z.array(z.string()),
  allocation: z.number().min(0).max(100),
  cadence: z.string(),
  rationale: z.string(),
  role: z.string().default('Channel profile'),
  primaryKPI: z.string().default('Engagement'),
}));

export const StrategyFormatItemSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') return { name: raw, description: raw };
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.format ?? raw.formatName ?? raw.type ?? '',
    description: raw.description ?? raw.details ?? raw.explanation ?? raw.summary ?? '',
  };
}, z.object({
  name: z.string(),
  description: z.string(),
}));

export const StrategyThemeItemSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') {
    return {
      name: raw,
      explanation: raw,
      strategicPurpose: 'Establish strategic positioning',
      relatedPillar: 'General',
      funnelStages: ['TOFU'],
    };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.theme ?? raw.title ?? '',
    explanation: raw.explanation ?? raw.description ?? raw.rationale ?? raw.details ?? '',
    strategicPurpose: raw.strategicPurpose ?? raw.strategic_purpose ?? 'Establish strategic positioning',
    relatedPillar: raw.relatedPillar ?? raw.related_pillar ?? 'General',
    funnelStages: raw.funnelStages ?? raw.funnel_stages ?? ['TOFU'],
  };
}, z.object({
  name: z.string(),
  explanation: z.string(),
  strategicPurpose: z.string().default('Establish strategic positioning'),
  relatedPillar: z.string().default('General'),
  funnelStages: z.array(z.string()).default(['TOFU']),
}));

export const StrategyCampaignOpportunitySchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.campaign ?? raw.campaignName ?? '',
    objective: raw.objective ?? raw.goal ?? raw.campaignObjective ?? '',
    audience: raw.audience ?? raw.targetAudience ?? raw.target_audience ?? raw.audienceSegment ?? '',
    funnelStage: raw.funnelStage ?? raw.funnel_stage ?? raw.stage ?? raw.funnel ?? '',
    suggestedPlatforms: raw.suggestedPlatforms ?? raw.suggested_platforms ?? raw.platforms ?? raw.recommendedPlatforms ?? [],
    suggestedFormats: raw.suggestedFormats ?? raw.suggested_formats ?? raw.formats ?? raw.recommendedFormats ?? [],
    duration: raw.duration ?? '4 weeks',
    cta: raw.cta ?? 'Learn More',
    successMetric: raw.successMetric ?? raw.success_metric ?? 'Clicks / conversions',
    rationale: raw.rationale ?? raw.reasoning ?? raw.justification ?? '',
    relatedContentPillars: raw.relatedContentPillars ?? raw.related_content_pillars ?? [],
  };
}, z.object({
  name: z.string(),
  objective: z.string(),
  audience: z.string(),
  funnelStage: z.string(),
  suggestedPlatforms: z.array(z.string()),
  suggestedFormats: z.array(z.string()),
  duration: z.string().default('4 weeks'),
  cta: z.string().default('Learn More'),
  successMetric: z.string().default('Clicks / conversions'),
  rationale: z.string(),
  relatedContentPillars: z.array(z.string()).default([]),
}));

export const StrategyAIReasoningItemSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    section: raw.section ?? raw.area ?? raw.topic ?? raw.name ?? '',
    observation: raw.observation ?? raw.insight ?? raw.finding ?? '',
    evidence: raw.evidence ?? raw.data ?? raw.support ?? '',
    reasoning: raw.reasoning ?? raw.rationale ?? raw.analysis ?? '',
    recommendation: raw.recommendation ?? raw.action ?? raw.suggestion ?? '',
    implication: raw.implication ?? 'Strategic implication based on observation',
    decision: raw.decision ?? 'Decision regarding marketing mix allocation',
    sources: raw.sources ?? raw.sourceIds ?? raw.source_ids ?? [],
  };
}, z.object({
  section: z.string(),
  observation: z.string(),
  evidence: z.string(),
  reasoning: z.string(),
  recommendation: z.string(),
  implication: z.string().default('Strategic implication based on observation'),
  decision: z.string().default('Decision regarding marketing mix allocation'),
  sources: z.array(z.string()),
}));

export const StrategySchema = z.object({
  goal: StrategyGoalSchema,
  audienceSegments: StrategyAudienceSchema,
  contentPillars: z.array(StrategyContentPillarSchema),
  contentMix: z.array(StrategyContentMixItemSchema),
  funnelMapping: StrategyFunnelMappingSchema,
  platformStrategy: z.array(StrategyPlatformItemSchema),
  formats: z.array(StrategyFormatItemSchema),
  cadence: z.preprocess(normalizeCadence, z.array(z.object({
    platform: z.string(),
    cadence: z.string(),
  }))),
  themes: z.array(StrategyThemeItemSchema),
  campaignOpportunities: z.array(StrategyCampaignOpportunitySchema),
  reasoning: z.array(StrategyAIReasoningItemSchema),
  sources: z.array(StrategySourceSchema),
  dataLimitations: z.preprocess((raw: any) => {
    if (!raw || typeof raw !== 'object') {
      return {
        historicalPerformance: 'UNAVAILABLE',
        competitorData: 'UNAVAILABLE',
        audienceData: 'INFERRED',
        notes: ['Historical performance is completely UNAVAILABLE because no analytics integrations are connected.'],
      };
    }
    return raw;
  }, DataLimitationsSchema).optional(),
  experiments: z.preprocess((raw: any) => {
    if (!Array.isArray(raw)) return [];
    return raw;
  }, z.array(ExperimentSchema)).optional().default([]),
});
