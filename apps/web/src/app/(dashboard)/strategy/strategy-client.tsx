'use client';

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  Target,
  Users,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  BarChart3,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getActiveStrategy, 
  getStrategyGenerationStatus, 
  regenerateStrategy,
  approveStrategy,
  generateContentCalendar,
  getLatestContentPlan
} from './actions';
import { useRouter } from 'next/navigation';

interface StrategyClientProps {
  brandId: string;
  brandName: string;
  userRole: string;
}

export default function StrategyClient({ brandId, brandName, userRole }: StrategyClientProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dismissedPlanIds, setDismissedPlanIds] = useState<string[]>([]);
  const [hasJustGeneratedCalendar, setHasJustGeneratedCalendar] = useState(false);

  // 1. Fetch active strategy
  const { data: activeStrategy, isLoading: isLoadingActive } = useQuery({
    queryKey: ['active-strategy', brandId],
    queryFn: () => getActiveStrategy(brandId),
  });

  // 2. Fetch currently generating strategy (if any)
  const { data: generatingStrategy } = useQuery({
    queryKey: ['generating-strategy', brandId],
    queryFn: () => getStrategyGenerationStatus(brandId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === 'GENERATING') {
        return 3000; // Poll every 3 seconds
      }
      return false;
    },
  });

  // Latest content plan query (polls if status is GENERATING)
  const { data: latestContentPlan } = useQuery({
    queryKey: ['latest-content-plan', brandId],
    queryFn: () => getLatestContentPlan(brandId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status === 'GENERATING') {
        return 3000;
      }
      return false;
    },
  });

  // Redirect to calendar if generation completed
  if (hasJustGeneratedCalendar && latestContentPlan && latestContentPlan.status === 'COMPLETED') {
    setHasJustGeneratedCalendar(false);
    setTimeout(() => {
      router.push('/calendar');
    }, 1000);
  }

  // 3. Invalidate queries when generation completes or fails
  const prevGeneratingId = generatingStrategy?.id;
  const prevGeneratingStatus = generatingStrategy?.status;
  
  if (prevGeneratingId && prevGeneratingStatus !== 'GENERATING') {
    // If it was generating but now it has transitioned to COMPLETED or FAILED
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['active-strategy', brandId] });
      queryClient.invalidateQueries({ queryKey: ['generating-strategy', brandId] });
    }, 500);
  }

  // 4. Regeneration mutation
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateStrategy(brandId),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['generating-strategy', brandId] });
        setErrorMsg(null);
      } else {
        setErrorMsg(data.error || 'Failed to start strategy generation');
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'An error occurred during request');
    },
  });

  const handleRegenerate = () => {
    if (confirm('Are you sure you want to generate/regenerate the marketing strategy? This will analyze your active Brand DNA, competitor intelligence, and products.')) {
      regenerateMutation.mutate();
    }
  };

  // Approve Strategy Mutation
  const approveMutation = useMutation({
    mutationFn: () => approveStrategy(brandId, activeStrategy?.id || ''),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-strategy', brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to approve strategy');
    },
  });

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this strategy? Once approved, the strategy will be locked and cannot be regenerated or modified.')) {
      approveMutation.mutate();
    }
  };

  // Generate Calendar Mutation
  const generateCalendarMutation = useMutation({
    mutationFn: () => generateContentCalendar(activeStrategy?.id || ''),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['latest-content-plan', brandId] });
      setHasJustGeneratedCalendar(true);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to start calendar generation');
    },
  });

  const handleGenerateCalendar = () => {
    generateCalendarMutation.mutate();
  };

  const isPlanGenerating = (latestContentPlan?.status === 'GENERATING') || generateCalendarMutation.isPending;
  const isGenerating = generatingStrategy?.status === 'GENERATING' || regenerateMutation.isPending;
  const isViewer = userRole === 'VIEWER';

  // Render loading state if initially loading active strategy and no data exists yet
  if (isLoadingActive && !activeStrategy) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-medium mb-1">Loading Marketing Strategy...</h3>
      </div>
    );
  }

  // Cast JSON fields
  const goal = activeStrategy?.goal as any;
  const audience = activeStrategy?.audienceSegments as any;
  const contentPillars = (activeStrategy?.contentPillars as any[]) || [];
  const contentMix = (activeStrategy?.contentMix as any[]) || [];
  const funnel = activeStrategy?.funnelMapping as any;
  const platforms = (activeStrategy?.platformStrategy as any[]) || [];
  const formats = (activeStrategy?.formats as any[]) || [];
  const cadence = (activeStrategy?.cadence as any[]) || [];
  const themes = (activeStrategy?.themes as any[]) || [];
  const campaigns = (activeStrategy?.campaignOpportunities as any[]) || [];
  const reasoning = (activeStrategy?.reasoning as any[]) || [];
  const sources = (activeStrategy?.sources as any[]) || [];
  const dataLimitations = (activeStrategy?.dataLimitations as any) || null;
  const experiments = (activeStrategy?.experiments as any[]) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Marketing Strategy Engine</h1>
          <p className="text-xs text-gray-400 mt-1">
            Analyze brand DNA, competitors, and catalog to build customer-centric marketing maps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          {activeStrategy?.approvalStatus === 'APPROVED' && (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              APPROVED & LOCKED
            </span>
          )}

          {/* Approve Button */}
          {activeStrategy && activeStrategy.approvalStatus !== 'APPROVED' && !isGenerating && (userRole === 'OWNER' || userRole === 'APPROVER') && (
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve Strategy</span>
            </button>
          )}

          {/* Generate Calendar Button */}
          {activeStrategy?.approvalStatus === 'APPROVED' && (
            <button
              onClick={handleGenerateCalendar}
              disabled={isPlanGenerating}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              {isPlanGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isPlanGenerating ? 'Generating Calendar...' : 'Generate Calendar'}</span>
            </button>
          )}

          <button
            onClick={handleRegenerate}
            disabled={isGenerating || isViewer}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating Strategy...' : activeStrategy ? 'Regenerate Strategy' : 'Generate Strategy'}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-300 text-sm flex justify-between items-center">
          <span>{errorMsg === 'CALENDAR_GENERATION_ALREADY_IN_PROGRESS' ? 'A calendar generation job is already running.' : (errorMsg === 'GENERATION_ALREADY_IN_PROGRESS' ? 'A strategy generation job is already running for this brand.' : errorMsg)}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-semibold text-rose-400 hover:text-rose-300">Dismiss</button>
        </div>
      )}

      {/* Calendar Generation Failed Alert */}
      {latestContentPlan && latestContentPlan.status === 'FAILED' && !dismissedPlanIds.includes(latestContentPlan.id) && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <div>
              <h4 className="text-sm font-semibold text-white">Content Calendar Generation Failed</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                The AI failed to compile constraints or model outputs to generate the content plan. You may have exceeded your AI quota. Please try again later.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissedPlanIds(prev => [...prev, latestContentPlan.id])}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Calendar Generating Status Alert */}
      {isPlanGenerating && (
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <div>
              <h4 className="text-sm font-semibold text-white">Generating Content Calendar...</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                The content scheduler is mapping themes, 플랫폼 templates, and date slots based on your approved strategy. You will be redirected shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generating Status Alert */}
      {generatingStrategy && generatingStrategy.status === 'GENERATING' && (
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <div>
              <h4 className="text-sm font-semibold text-white">Generating Strategy v{generatingStrategy.version}...</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                The model is analyzing products, brand DNA, and competitor gaps. Your current active strategy remains visible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Last Generation Status Alert */}
      {generatingStrategy && generatingStrategy.status === 'FAILED' && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <div>
              <h4 className="text-sm font-semibold text-white">Generation of v{generatingStrategy.version} Failed</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                The AI failed to compile constraints or model outputs. The previous active strategy was preserved.
              </p>
            </div>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['generating-strategy', brandId] })}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main strategy rendering */}
      {!activeStrategy ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
          <Sparkles className="w-10 h-10 text-purple-500 mb-4" />
          <h3 className="text-white font-medium mb-1">No Strategy Generated Yet</h3>
          <p className="text-gray-400 text-sm max-w-md text-center mb-6">
            Make sure your Brand DNA is ACTIVE, then click Generate Strategy to create your first marketing layout.
          </p>
          {!isViewer && (
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate First Strategy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Data Limitations Banner */}
          {dataLimitations && (
            <div className="bg-[#12111A]/90 border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="bg-yellow-500/10 p-2 rounded-xl mt-0.5">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-yellow-400">Strategy Data Limitations</h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                  This strategy was generated with incomplete context. Outcomes rely on the AI's best extrapolations based on the data provided below.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Historical:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${dataLimitations.historicalPerformance === 'UNAVAILABLE' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {dataLimitations.historicalPerformance}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Competitor:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${dataLimitations.competitorData === 'UNAVAILABLE' ? 'bg-rose-500/10 text-rose-400' : dataLimitations.competitorData === 'WEBSITE_ONLY' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {dataLimitations.competitorData}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Audience:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${dataLimitations.audienceData === 'UNAVAILABLE' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {dataLimitations.audienceData}
                    </span>
                  </div>
                </div>
                {dataLimitations.notes && dataLimitations.notes.length > 0 && (
                  <ul className="list-disc pl-4 pt-2 text-[11px] text-gray-400 space-y-1">
                    {dataLimitations.notes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Goal & Audience row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Goal Card */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Strategic Goals (v{activeStrategy.version})</h3>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Target & Timeframe</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-md font-bold">{goal?.target || 'N/A'}</span>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-md font-medium">{goal?.timeframe || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Business Outcome</h4>
                  <p className="text-xs text-emerald-300 font-medium">{goal?.businessOutcome || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Measurable Objective</h4>
                  <p className="text-xs text-gray-200 bg-white/5 p-3 rounded-xl leading-relaxed">{goal?.measurableObjective || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Leading Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {((goal?.leadingIndicators as string[]) || []).map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-full font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Audience Card */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Target Audience Segments</h3>
              </div>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Primary Segment</h4>
                    <p className="text-xs text-white font-medium">{audience?.primarySegment || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{audience?.demographics}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Job To Be Done</h4>
                    <p className="text-xs text-purple-300 italic">"{audience?.jobToBeDone || 'N/A'}"</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Pain Points</h4>
                      <ul className="list-disc pl-4 text-xs text-rose-300 space-y-1">
                        {((audience?.painPoints as string[]) || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Motivations</h4>
                      <ul className="list-disc pl-4 text-xs text-emerald-300 space-y-1">
                        {((audience?.motivations as string[]) || []).map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pillars and Mix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content Pillars */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Content Pillars</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {contentPillars.map((p: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-white text-xs">{p.name}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${p.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : p.priority === 'LOW' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                          {p.priority || 'MEDIUM'}
                        </span>
                        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                          {p.recommendedWeight}%
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{p.description}</p>
                    <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
                      <p className="text-[10px] text-emerald-400 italic">Outcome: {p.expectedOutcome}</p>
                      <p className="text-[10px] text-gray-400">Stages: {((p.targetFunnelStages as string[]) || []).join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Mix */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Recommended Content Mix</h3>
              </div>
              <div className="space-y-4 pt-2">
                {contentMix.map((mix: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-300">{mix.category}</span>
                        <span className="text-[9px] bg-white/10 text-gray-400 px-1 rounded">{mix.funnelStage}</span>
                      </div>
                      <span className="font-semibold text-purple-400">{mix.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#1C1A2B] h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${mix.percentage}%` }} />
                    </div>
                    <p className="text-[10px] text-emerald-400 italic leading-snug">{mix.expectedOutcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Funnel Mapping */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Funnel Mapping</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {['TOFU', 'MOFU', 'BOFU'].map((stage) => {
                const stageData = funnel?.[stage];
                return (
                  <div key={stage} className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-bold text-white text-sm tracking-wider">{stage}</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                        Allocation: {stageData?.recommendedAllocation || 0}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Objective</h4>
                        <p className="text-xs text-gray-200 mt-0.5 leading-relaxed">{stageData?.objective || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Audience Intent</h4>
                        <p className="text-xs text-purple-300 mt-0.5 leading-relaxed italic">"{stageData?.audienceIntent || 'N/A'}"</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Recommended Formats</h4>
                        <div className="flex flex-wrap gap-1">
                          {((stageData?.contentTypes as string[]) || []).map((t, i) => (
                            <span key={i} className="text-[9px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 mt-2">
                        <p className="text-[10px] text-gray-400"><span className="font-semibold text-emerald-400">Next Action: </span>{stageData?.desiredNextAction}</p>
                        <p className="text-[10px] text-gray-400"><span className="font-semibold text-rose-400">CTA: </span>{stageData?.recommendedCTA}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Strategy */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Platform-Specific Strategies</h3>
            </div>
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3 px-4 font-semibold uppercase">Platform</th>
                    <th className="py-3 px-4 font-semibold uppercase">Objective</th>
                    <th className="py-3 px-4 font-semibold uppercase">Audience Fit</th>
                    <th className="py-3 px-4 font-semibold uppercase">Formats</th>
                    <th className="py-3 px-4 font-semibold uppercase">Allocation</th>
                    <th className="py-3 px-4 font-semibold uppercase">Cadence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {platforms.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">{p.platform}</td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300 max-w-xs truncate" title={p.objective}>{p.objective}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Role: {p.role}</p>
                        <p className="text-[10px] text-emerald-400 mt-0.5">KPI: {p.primaryKPI}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{p.audienceFit}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {((p.formats as string[]) || []).map((f, idx) => (
                            <span key={idx} className="text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-purple-400">{p.allocation}%</td>
                      <td className="py-4 px-4 text-gray-400">{p.cadence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formats, Cadence, Themes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formats */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Content Formats</h3>
              <div className="space-y-3 pt-2">
                {formats.map((f: any, i: number) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl">
                    <span className="font-bold text-white text-xs">{f.name}</span>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cadence */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Publishing Cadence</h3>
              <div className="space-y-3 pt-2">
                {cadence.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-xs">
                    <span className="font-semibold text-white">{c.platform}</span>
                    <span className="text-gray-400">{c.cadence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Strategic Themes</h3>
              <div className="space-y-3 pt-2">
                {themes.map((t: any, i: number) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl">
                    <span className="font-bold text-white text-xs">{t.name}</span>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{t.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Opportunities */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Campaign Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {campaigns.map((c: any, i: number) => (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold">
                      {c.funnelStage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{c.objective}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">Audience: </span>{c.audience}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">Duration: </span>{c.duration}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 flex flex-wrap gap-2 pt-1">
                    <span className="font-semibold text-gray-300">Platforms:</span>
                    {((c.suggestedPlatforms as string[]) || []).map((p, idx) => (
                      <span key={idx} className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-white">{p}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 border-t border-white/5 pt-2">
                    <div className="text-[10px] text-emerald-400">
                      <span className="font-semibold">Metric: </span>{c.successMetric}
                    </div>
                    <div className="text-[10px] text-rose-400">
                      <span className="font-semibold">CTA: </span>{c.cta}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed pt-2 border-t border-white/5 italic">
                    <span className="font-semibold not-italic">Rationale: </span>{c.rationale}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Experiments */}
          {experiments && experiments.length > 0 && (
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Proposed Experiments & Tests</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {experiments.map((exp: any, i: number) => (
                  <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-3 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
                    <div className="flex justify-between items-start gap-2 relative">
                      <span className="font-bold text-white text-sm">{exp.hypothesis}</span>
                      <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                        {exp.testVariable}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div className="text-gray-400">
                        <span className="font-semibold text-emerald-400">Metric: </span>{exp.metricToMeasure}
                      </div>
                      <div className="text-gray-400">
                        <span className="font-semibold text-gray-300">Duration: </span>{exp.duration}
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 leading-relaxed pt-2 border-t border-white/5 italic">
                      <span className="font-semibold not-italic">Expected Insight: </span>{exp.expectedInsight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning & Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Reasoning */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 lg:col-span-2 space-y-4">
              <h3 className="text-base font-semibold text-white">AI Strategy Reasoning</h3>
              <div className="space-y-4 pt-2">
                {reasoning.map((r: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-bold text-purple-400 text-xs">{r.section}</span>
                      <div className="flex gap-2">
                        {((r.sources as string[]) || []).map((srcId, idx) => (
                          <span key={idx} className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-semibold">
                            Source: {srcId}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-white leading-relaxed"><span className="font-semibold text-gray-400">Observation: </span>{r.observation}</p>
                    <p className="text-xs text-rose-300 leading-relaxed"><span className="font-semibold text-gray-400">Evidence: </span>{r.evidence}</p>
                    <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-semibold text-gray-400">Implication: </span>{r.implication}</p>
                    <p className="text-xs text-gray-300 leading-relaxed"><span className="font-semibold text-gray-400">Reasoning: </span>{r.reasoning}</p>
                    <div className="pt-2 border-t border-white/5 mt-2 space-y-1">
                      <p className="text-xs text-emerald-300 leading-relaxed"><span className="font-semibold text-gray-400">Decision: </span>{r.decision}</p>
                      <p className="text-xs text-emerald-400/80 leading-relaxed italic"><span className="font-semibold text-gray-400 not-italic">Recommendation: </span>{r.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traceable Sources */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Traceable Sources</h3>
              <div className="space-y-3 pt-2">
                {sources.map((src: any, i: number) => (
                  <div key={i} className="p-3 bg-[#0B0A11]/60 border border-white/5 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold uppercase">
                        {src.type}
                      </span>
                      <span className="text-[9px] text-gray-500">{src.id}</span>
                    </div>
                    <p className="text-xs text-white font-medium pt-1">{src.label}</p>
                  </div>
                ))}
                {sources.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No source mapping available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
