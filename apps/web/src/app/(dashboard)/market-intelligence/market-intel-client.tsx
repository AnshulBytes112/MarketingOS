'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  FileText, 
  CheckCircle, 
  Calendar, 
  X, 
  ChevronRight,
  Shield,
  Lightbulb,
  ExternalLink,
  Target
} from 'lucide-react';
import { 
  getMarketInsights, 
  getLatestRunStatus, 
  refreshMarketIntelligence, 
  useOpportunityInContent 
} from './actions';

interface Brand {
  id: string;
  name: string;
}

interface MarketInsight {
  id: string;
  type: string;
  title: string;
  summary: string;
  description: string | null;
  source: string;
  sourceUrl: string | null;
  observedAt: Date | string;
  relevanceScore: number;
  confidence: string;
  implications: any;
  opportunities: any;
  risks: any;
  contentOpportunities: any;
}

interface MarketIntelligenceRun {
  id: string;
  status: string;
  error: string | null;
  updatedAt: Date | string;
}

interface MarketIntelClientProps {
  brands: Brand[];
  canRefresh: boolean;
  canAnalyze: boolean;
  canExport: boolean;
  canCreateContent: boolean;
}

export default function MarketIntelClient({
  brands,
  canRefresh,
  canAnalyze,
  canExport,
  canCreateContent,
}: MarketIntelClientProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || '');
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [runStatus, setRunStatus] = useState<MarketIntelligenceRun | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Active query parameters (triggering loadInsights)
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('ALL');
  const [minRelevance, setMinRelevance] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local user input UI states (no immediate api calls when user types/drags)
  const [searchInput, setSearchInput] = useState<string>('');
  const [typeSelect, setTypeSelect] = useState<string>('ALL');
  const [confidenceSelect, setConfidenceSelect] = useState<string>('ALL');
  const [relevanceSlider, setRelevanceSlider] = useState<number>(0);

  // Selected Insight details modal
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null);

  // Content idea creation dialog state
  const [showIdeaDialog, setShowIdeaDialog] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [funnelStage, setFunnelStage] = useState<string>('AWARENESS');
  const [contentPillar, setContentPillar] = useState<string>('Brand Positioning');
  const [ideaCreating, setIdeaCreating] = useState<boolean>(false);
  const [ideaSuccess, setIdeaSuccess] = useState<string | null>(null);

  const handleApplyFilters = () => {
    setTypeFilter(typeSelect);
    setConfidenceFilter(confidenceSelect);
    setMinRelevance(relevanceSlider);
    setSearchQuery(searchInput);
  };

  // Load insights
  const loadInsights = useCallback(async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    try {
      const data = await getMarketInsights({
        brandId: selectedBrandId,
        type: typeFilter,
        confidence: confidenceFilter,
        minRelevance: minRelevance > 0 ? minRelevance : undefined,
        searchQuery: searchQuery || undefined,
      });
      setInsights(data as any[]);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBrandId, typeFilter, confidenceFilter, minRelevance, searchQuery]);

  // Load run status
  const loadRunStatus = useCallback(async () => {
    if (!selectedBrandId) return;
    try {
      const run = await getLatestRunStatus(selectedBrandId);
      setRunStatus(run as any);
      if (run && (run.status === 'QUEUED' || run.status === 'ANALYZING')) {
        setRefreshing(true);
      } else {
        setRefreshing(false);
      }
    } catch (err) {
      console.error('Failed to load run status:', err);
    }
  }, [selectedBrandId]);

  // Initial load
  useEffect(() => {
    if (selectedBrandId) {
      loadInsights();
      loadRunStatus();
    }
  }, [selectedBrandId, loadInsights, loadRunStatus]);

  // Polling for active runs
  useEffect(() => {
    let interval: any;
    if (refreshing && selectedBrandId) {
      interval = setInterval(() => {
        loadRunStatus();
        loadInsights();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshing, selectedBrandId, loadRunStatus, loadInsights]);

  // Trigger refresh
  const handleRefresh = async () => {
    if (!selectedBrandId || refreshing) return;
    setRefreshing(true);
    try {
      const res = await refreshMarketIntelligence(selectedBrandId);
      if (res.success) {
        setRunStatus(res.run as any);
      }
    } catch (err) {
      console.error('Failed to start refresh:', err);
      setRefreshing(false);
    }
  };

  // Convert opportunity to content item
  const handleCreateContentIdea = async () => {
    if (!selectedInsight || !scheduledDate || ideaCreating) return;
    setIdeaCreating(true);
    setIdeaSuccess(null);
    try {
      const res = await useOpportunityInContent({
        insightId: selectedInsight.id,
        scheduledDate,
        funnelStage,
        contentPillar,
      });
      if (res.success) {
        setIdeaSuccess(`Successfully created draft content idea "${res.item.title}" scheduled for ${new Date(scheduledDate).toLocaleDateString()}`);
        setTimeout(() => {
          setShowIdeaDialog(false);
          setIdeaSuccess(null);
          setSelectedInsight(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Failed to create content idea:', err);
      alert(err.message || 'Failed to create content idea');
    } finally {
      setIdeaCreating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'TREND':
        return <TrendingUp className="w-5 h-5 text-indigo-400" />;
      case 'RISK':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'OPPORTUNITY':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'CONTENT_OPPORTUNITY':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'COMPETITOR_MOVEMENT':
        return <Target className="w-5 h-5 text-sky-400" />;
      default:
        return <Info className="w-5 h-5 text-violet-400" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">High Confidence</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium Confidence</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Low Confidence</span>;
    }
  };

  const getRelevanceBar = (score: number) => {
    let color = 'bg-indigo-500';
    if (score >= 80) color = 'bg-violet-500';
    else if (score >= 60) color = 'bg-fuchsia-500';
    else if (score < 40) color = 'bg-slate-500';

    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-white/10 rounded-full h-2 overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-xs font-bold text-gray-300">{score}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Brand Select and Actions Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0E0D15] border border-white/5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Brand</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="" disabled>Choose a brand...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {runStatus && (
            <div className="flex items-center gap-2 self-end sm:self-center bg-[#161522] border border-white/5 px-4 py-2.5 rounded-lg text-sm">
              {runStatus.status === 'QUEUED' && (
                <>
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-gray-300 font-medium">Refresh Queued...</span>
                </>
              )}
              {runStatus.status === 'ANALYZING' && (
                <>
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-gray-300 font-medium">Analyzing market signals...</span>
                </>
              )}
              {runStatus.status === 'COMPLETED' && (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-400">
                    Latest insights loaded (
                    {new Date(runStatus.updatedAt).toLocaleTimeString()}
                    )
                  </span>
                </>
              )}
              {runStatus.status === 'FAILED' && (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-300 font-medium" title={runStatus.error || undefined}>
                    Refresh failed
                  </span>
                </>
              )}
              {runStatus.status === 'NOT_CONFIGURED' && (
                <>
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Provider integration required (No external API configured)</span>
                </>
              )}
            </div>
          )}
        </div>

        {canRefresh && selectedBrandId && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800/40 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Intelligence
          </button>
        )}
      </div>

      {selectedBrandId ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 p-6 bg-[#0E0D15] border border-white/5 rounded-2xl h-fit space-y-6">
            <div className="flex items-center gap-2 text-white font-semibold">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Keyword, source..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-[#161522] border border-white/10 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-violet-500 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Insight Type</label>
              <select
                value={typeSelect}
                onChange={(e) => setTypeSelect(e.target.value)}
                className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="ALL">All Types</option>
                <option value="TREND">Trends</option>
                <option value="RISK">Risks</option>
                <option value="OPPORTUNITY">Strategic Opportunities</option>
                <option value="CONTENT_OPPORTUNITY">Content Ideas</option>
                <option value="COMPETITOR_MOVEMENT">Competitor Activity</option>
                <option value="INDUSTRY_SIGNAL">Industry Regulations</option>
                <option value="AUDIENCE_SIGNAL">Audience Sentiment</option>
              </select>
            </div>

            {/* Confidence Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confidence Level</label>
              <select
                value={confidenceSelect}
                onChange={(e) => setConfidenceSelect(e.target.value)}
                className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="ALL">All Confidence Levels</option>
                <option value="HIGH">High Only</option>
                <option value="MEDIUM">Medium or High</option>
                <option value="LOW">Low or High</option>
              </select>
            </div>

            {/* Relevance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Min Relevance</label>
                <span className="text-xs font-bold text-violet-400">{relevanceSlider}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={relevanceSlider}
                onChange={(e) => setRelevanceSlider(parseInt(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer bg-white/15 rounded-lg appearance-none h-1.5"
              />
            </div>
            <button
              onClick={handleApplyFilters}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-2.5 text-sm font-semibold transition"
            >
              Apply Filters
            </button>
          </div>

          {/* Insights List */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-[#0E0D15] border border-white/5 rounded-2xl space-y-4">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-gray-400 text-sm">Querying market insights...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center p-16 bg-[#0E0D15] border border-white/5 rounded-2xl space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">No insights matching criteria</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Try adjusting your filters, searching for another keyword, or triggering a "Refresh Intelligence" run.
                </p>
              </div>
            ) : (
              <div className="bg-[#0E0D15] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-gray-400 bg-white/[0.02]">
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Title / Source</th>
                        <th className="px-6 py-4">Relevance</th>
                        <th className="px-6 py-4">Confidence</th>
                        <th className="px-6 py-4">Observed At</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {insights.map((insight) => (
                        <tr 
                          key={insight.id} 
                          className="hover:bg-white/[0.01] transition cursor-pointer"
                          onClick={() => setSelectedInsight(insight)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getInsightIcon(insight.type)}
                              <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">
                                {insight.type.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-semibold text-white max-w-sm truncate">{insight.title}</div>
                              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                                <span>{insight.source}</span>
                                {insight.sourceUrl && (
                                  <a 
                                    href={insight.sourceUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-violet-400"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRelevanceBar(insight.relevanceScore)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getConfidenceBadge(insight.confidence)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                            {new Date(insight.observedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center p-16 bg-[#0E0D15] border border-white/5 rounded-2xl">
          <p className="text-gray-400">Please select or configure a brand to load market intelligence insights.</p>
        </div>
      )}

      {/* Detail Modal / Side Panel */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-screen bg-[#0E0D15] border-l border-white/10 p-8 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {getInsightIcon(selectedInsight.type)}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedInsight.type.replace('_', ' ')}</span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{selectedInsight.title}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 py-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Relevance</span>
                  {getRelevanceBar(selectedInsight.relevanceScore)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Confidence</span>
                  {getConfidenceBadge(selectedInsight.confidence)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Source</span>
                  <span className="text-sm font-semibold text-gray-300">{selectedInsight.source}</span>
                </div>
              </div>

              {/* Observed Data (Observed Facts) */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Observed Facts (Data Honesty)
                </h4>
                <p className="text-sm text-gray-300 font-medium">
                  {selectedInsight.summary}
                </p>
                {selectedInsight.description && (
                  <p className="text-xs text-gray-400 pt-1 leading-relaxed">
                    {selectedInsight.description}
                  </p>
                )}
              </div>

              {/* AI Strategic Interpretation */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Interpretation & Strategic Implications
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {typeof selectedInsight.implications === 'string' 
                    ? selectedInsight.implications 
                    : JSON.stringify(selectedInsight.implications, null, 2)}
                </p>
              </div>

              {/* Opportunities & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Opportunities
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                    {Array.isArray(selectedInsight.opportunities) ? (
                      selectedInsight.opportunities.map((o, idx) => <li key={idx}>{o}</li>)
                    ) : (
                      <li>{JSON.stringify(selectedInsight.opportunities)}</li>
                    )}
                  </ul>
                </div>
                <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Risks & Mitigation
                  </h4>
                  <ul className="list-disc pl-4 text-xs text-gray-400 space-y-1">
                    {Array.isArray(selectedInsight.risks) ? (
                      selectedInsight.risks.map((r, idx) => <li key={idx}>{r}</li>)
                    ) : (
                      <li>{JSON.stringify(selectedInsight.risks)}</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Content Opportunity Action Proposal */}
              {selectedInsight.contentOpportunities && (
                <div className="p-5 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/20 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Proposed Content Idea
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Platform</span>
                      <span className="font-semibold text-white">{selectedInsight.contentOpportunities.platform || 'LinkedIn'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">Format</span>
                      <span className="font-semibold text-white">{selectedInsight.contentOpportunities.format || 'Text Post'}</span>
                    </div>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <span className="text-gray-400 block mb-0.5">Title proposal</span>
                    <p className="font-semibold text-white">{selectedInsight.contentOpportunities.title}</p>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <span className="text-gray-400 block mb-0.5">Suggested Hook</span>
                    <p className="italic text-gray-300 bg-black/30 p-2.5 border border-white/5 rounded-lg leading-relaxed">
                      "{selectedInsight.contentOpportunities.hook}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="pt-6 border-t border-white/5 flex gap-3">
              {canCreateContent && selectedInsight.contentOpportunities && (
                <button
                  onClick={() => setShowIdeaDialog(true)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2.5 text-sm font-semibold transition"
                >
                  Create Content Idea
                </button>
              )}
              <button
                onClick={() => setSelectedInsight(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-2.5 text-sm font-semibold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idea Creation Dialog Modal (Requires Explicit Confirmation) */}
      {showIdeaDialog && selectedInsight && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0E0D15] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Confirm Content Idea Creation
              </h3>
              <button 
                onClick={() => setShowIdeaDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ideaSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{ideaSuccess}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">
                  This action will insert a draft content idea item into the Content Calendar. Actual text/image generation will remain on-demand in the Content Engine.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage</label>
                  <select
                    value={funnelStage}
                    onChange={(e) => setFunnelStage(e.target.value)}
                    className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="AWARENESS">Awareness</option>
                    <option value="CONSIDERATION">Consideration</option>
                    <option value="CONVERSION">Conversion</option>
                    <option value="RETENTION">Retention</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content Pillar</label>
                  <input
                    type="text"
                    value={contentPillar}
                    onChange={(e) => setContentPillar(e.target.value)}
                    className="w-full bg-[#161522] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowIdeaDialog(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-2 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateContentIdea}
                    disabled={!scheduledDate || ideaCreating}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800/40 text-white rounded-lg py-2 text-sm font-semibold transition"
                  >
                    {ideaCreating ? 'Creating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple loader helper
function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
