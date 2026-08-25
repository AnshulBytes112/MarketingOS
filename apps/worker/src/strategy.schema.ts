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

// ── Goal: AI often returns a plain string or a flat object ──────────────────
const _GoalRaw = z.object({
  primaryGoal: z.string(),
  measurableObjective: z.string(),
  successMetrics: z.array(z.string()),
});

export const StrategyGoalSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') {
    return { primaryGoal: raw, measurableObjective: raw, successMetrics: [] };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    primaryGoal: raw.primaryGoal ?? raw.goal ?? raw.primary_goal ?? raw.objective ?? '',
    measurableObjective: raw.measurableObjective ?? raw.measurable_objective ?? raw.kpi ?? raw.metric ?? raw.primaryGoal ?? '',
    successMetrics: raw.successMetrics ?? raw.success_metrics ?? raw.metrics ?? raw.kpis ?? [],
  };
}, _GoalRaw);

// ── Audience: AI returns an array OR a single object ────────────────────────
const _AudienceRaw = z.object({
  primarySegment: z.string(),
  secondarySegments: z.array(z.string()),
  segmentNeeds: z.array(z.string()),
  painPoints: z.array(z.string()),
  motivations: z.array(z.string()),
});

export const StrategyAudienceSchema = z.preprocess((raw: any) => {
  // If the AI returns an array, collapse it — first item = primary, rest = secondary
  if (Array.isArray(raw)) {
    const [first, ...rest] = raw;
    const primary = typeof first === 'string' ? first : (first?.name ?? first?.segment ?? JSON.stringify(first));
    const secondary = rest.map((r: any) => typeof r === 'string' ? r : (r?.name ?? r?.segment ?? JSON.stringify(r)));
    return { primarySegment: primary, secondarySegments: secondary, segmentNeeds: [], painPoints: [], motivations: [] };
  }
  if (!raw || typeof raw !== 'object') return raw;
  return {
    primarySegment: raw.primarySegment ?? raw.primary_segment ?? raw.primary ?? raw.mainSegment ?? '',
    secondarySegments: raw.secondarySegments ?? raw.secondary_segments ?? raw.secondary ?? [],
    segmentNeeds: raw.segmentNeeds ?? raw.segment_needs ?? raw.needs ?? raw.requirements ?? [],
    painPoints: raw.painPoints ?? raw.pain_points ?? raw.challenges ?? raw.problems ?? [],
    motivations: raw.motivations ?? raw.drivers ?? raw.goals ?? raw.desires ?? [],
  };
}, _AudienceRaw);

// ── Content Pillar ─────────────────────────────────────────────────────────
const _ContentPillarRaw = z.object({
  name: z.string(),
  description: z.string(),
  objective: z.string(),
  recommendedWeight: z.number().min(0).max(100),
});

export const StrategyContentPillarSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') return { name: raw, description: raw, objective: raw, recommendedWeight: 20 };
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.pillar ?? raw.title ?? '',
    description: raw.description ?? raw.details ?? raw.summary ?? raw.name ?? '',
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? '',
    recommendedWeight: raw.recommendedWeight ?? raw.recommended_weight ?? raw.weight ?? raw.percentage ?? raw.allocation ?? 20,
  };
}, _ContentPillarRaw);

// ── Content Mix ────────────────────────────────────────────────────────────
const _ContentMixItemRaw = z.object({
  category: z.string(),
  percentage: z.number().min(0).max(100),
  rationale: z.string(),
});

export const StrategyContentMixItemSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    category: raw.category ?? raw.type ?? raw.contentCategory ?? raw.name ?? '',
    percentage: raw.percentage ?? raw.percent ?? raw.allocation ?? raw.weight ?? 0,
    rationale: raw.rationale ?? raw.reasoning ?? raw.description ?? '',
  };
}, _ContentMixItemRaw);

// ── Funnel Stage ───────────────────────────────────────────────────────────
const _FunnelStageRaw = z.object({
  objective: z.string(),
  contentTypes: z.array(z.string()),
  recommendedAllocation: z.number().min(0).max(100),
});

const StrategyFunnelStageSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? '',
    contentTypes: raw.contentTypes ?? raw.content_types ?? raw.types ?? raw.formats ?? raw.contentFormats ?? [],
    recommendedAllocation: raw.recommendedAllocation ?? raw.recommended_allocation ?? raw.allocation ?? raw.percentage ?? raw.percent ?? 33,
  };
}, _FunnelStageRaw);

// ── Funnel Mapping: AI sometimes uses top_of_funnel / ToFu / tofu ──────────
// _FunnelMappingRaw uses StrategyFunnelStageSchema (with preprocess) so that
// inner stage fields are also normalized before Zod validates them.
const _FunnelMappingRaw = z.object({
  TOFU: StrategyFunnelStageSchema,
  MOFU: StrategyFunnelStageSchema,
  BOFU: StrategyFunnelStageSchema,
});

function normalizeStage(raw: any): any {
  if (!raw || typeof raw !== 'object') return {};
  return {
    objective: raw.objective ?? raw.goal ?? raw.purpose ?? raw.aim ?? raw.description ?? '',
    contentTypes: raw.contentTypes ?? raw.content_types ?? raw.types ?? raw.formats ?? raw.contentFormats ?? raw.recommendedFormats ?? [],
    recommendedAllocation: raw.recommendedAllocation ?? raw.recommended_allocation ?? raw.allocation ?? raw.percentage ?? raw.percent ?? 33,
  };
}

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
}, _FunnelMappingRaw);

// ── Platform Item ──────────────────────────────────────────────────────────
const _PlatformItemRaw = z.object({
  platform: z.string(),
  objective: z.string(),
  audienceFit: z.string(),
  formats: z.array(z.string()),
  allocation: z.number().min(0).max(100),
  cadence: z.string(),
  rationale: z.string(),
});

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
  };
}, _PlatformItemRaw);

// ── Format Item ───────────────────────────────────────────────────────────
const _FormatItemRaw = z.object({
  name: z.string(),
  description: z.string(),
});

export const StrategyFormatItemSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') return { name: raw, description: raw };
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.format ?? raw.formatName ?? raw.type ?? '',
    description: raw.description ?? raw.details ?? raw.explanation ?? raw.summary ?? '',
  };
}, _FormatItemRaw);

// ── Theme Item ────────────────────────────────────────────────────────────
const _ThemeItemRaw = z.object({
  name: z.string(),
  explanation: z.string(),
});

export const StrategyThemeItemSchema = z.preprocess((raw: any) => {
  if (typeof raw === 'string') return { name: raw, explanation: raw };
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.theme ?? raw.title ?? '',
    explanation: raw.explanation ?? raw.description ?? raw.rationale ?? raw.details ?? '',
  };
}, _ThemeItemRaw);

// ── Campaign Opportunity ─────────────────────────────────────────────────
const _CampaignOpportunityRaw = z.object({
  name: z.string(),
  objective: z.string(),
  audience: z.string(),
  funnelStage: z.string(),
  suggestedPlatforms: z.array(z.string()),
  suggestedFormats: z.array(z.string()),
  rationale: z.string(),
});

export const StrategyCampaignOpportunitySchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    name: raw.name ?? raw.campaign ?? raw.campaignName ?? '',
    objective: raw.objective ?? raw.goal ?? raw.campaignObjective ?? '',
    audience: raw.audience ?? raw.targetAudience ?? raw.target_audience ?? raw.audienceSegment ?? '',
    funnelStage: raw.funnelStage ?? raw.funnel_stage ?? raw.stage ?? raw.funnel ?? '',
    suggestedPlatforms: raw.suggestedPlatforms ?? raw.suggested_platforms ?? raw.platforms ?? raw.recommendedPlatforms ?? [],
    suggestedFormats: raw.suggestedFormats ?? raw.suggested_formats ?? raw.formats ?? raw.recommendedFormats ?? [],
    rationale: raw.rationale ?? raw.reasoning ?? raw.justification ?? '',
  };
}, _CampaignOpportunityRaw);

// ── AI Reasoning Item ─────────────────────────────────────────────────────
const _AIReasoningItemRaw = z.object({
  section: z.string(),
  observation: z.string(),
  evidence: z.string(),
  reasoning: z.string(),
  recommendation: z.string(),
  sources: z.array(z.string()),
});

export const StrategyAIReasoningItemSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    section: raw.section ?? raw.area ?? raw.topic ?? raw.name ?? '',
    observation: raw.observation ?? raw.insight ?? raw.finding ?? '',
    evidence: raw.evidence ?? raw.data ?? raw.support ?? '',
    reasoning: raw.reasoning ?? raw.rationale ?? raw.analysis ?? '',
    recommendation: raw.recommendation ?? raw.action ?? raw.suggestion ?? '',
    sources: raw.sources ?? raw.sourceIds ?? raw.source_ids ?? [],
  };
}, _AIReasoningItemRaw);

// ── Source ────────────────────────────────────────────────────────────────
const _SourceRaw = z.object({
  type: z.enum(['BRAND_DNA', 'ONBOARDING', 'BRAND_PRODUCT', 'COMPETITOR_ACCOUNT', 'COMPETITOR_POST', 'AI_RECOMMENDATION']),
  id: z.string(),
  label: z.string(),
});

export const StrategySourceSchema = z.preprocess((raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    type: normalizeSourceType(raw.type ?? raw.sourceType ?? raw.category ?? ''),
    id: raw.id ?? raw.sourceId ?? raw.entityId ?? '',
    label: raw.label ?? raw.name ?? raw.title ?? raw.type ?? '',
  };
}, _SourceRaw);

// ── Root Strategy Schema ──────────────────────────────────────────────────
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
  sources: z.array(StrategySourceSchema).describe('Array of all source objects referenced in the strategy'),
}).describe('The complete structured marketing strategy');
