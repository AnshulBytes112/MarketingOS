'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, RefreshCw, Plus, Calendar, AlertTriangle, CheckCircle, Info, Sparkles, Check, Send, Globe
} from 'lucide-react';
import { 
  getCompetitorDetails, syncCompetitorNow, manuallyIngestPost, 
  generateCompetitorAnalysis, applyRecommendation 
} from './actions';
import { toast } from 'sonner';

// Custom platform icon SVGs matching the rest of the UI
const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17 1.22 1.32 2.92 2.1 4.74 2.2v3.77c-1.89-.04-3.72-.75-5.18-1.99-.08-.07-.15-.14-.23-.22v6.62c.03 2.19-.89 4.34-2.52 5.82-1.8 1.69-4.32 2.45-6.75 2.05-2.61-.41-4.9-2.28-5.75-4.79-.97-2.82-.41-6.07 1.51-8.32 1.63-1.96 4.1-3.04 6.67-2.92v3.74c-1.53-.16-3.08.38-4.08 1.56-.99 1.15-1.31 2.82-.82 4.28.48 1.48 1.86 2.58 3.42 2.76 1.49.2 3.05-.33 3.93-1.56.68-.89.98-2.05.95-3.16V0h-.4z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      );
    case 'website':
      return <Globe className={className} />;
    default:
      return <Info className={className} />;
  }
};

interface CompetitorDetailClientProps {
  competitorId: string;
  brandId: string;
  userRole: string;
}

export default function CompetitorDetailClient({ competitorId, brandId, userRole }: CompetitorDetailClientProps) {
  const queryClient = useQueryClient();
  const isViewer = userRole === 'VIEWER';

  // Manual Ingestion Form State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPlatform, setManualPlatform] = useState<'website' | 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok'>('website');
  const [manualUrl, setManualUrl] = useState('');
  const [manualPublishedAt, setManualPublishedAt] = useState(new Date().toISOString().split('T')[0]);
  const [manualCaption, setManualCaption] = useState('');
  const [manualLikes, setManualLikes] = useState(0);
  const [manualComments, setManualComments] = useState(0);
  const [manualShares, setManualShares] = useState(0);
  const [manualViews, setManualViews] = useState(0);
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  // Strategy unavailable banner state
  const [strategyNotice, setStrategyNotice] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // TanStack Query for loading details
  const { data, isLoading, error } = useQuery({
    queryKey: ['competitor-details', competitorId],
    queryFn: () => getCompetitorDetails(competitorId, brandId),
    refetchInterval: 10000, // Auto-refresh every 10s to see sync changes
  });

  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => syncCompetitorNow(competitorId, brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor-details', competitorId] });
    },
  });

  // Manual Ingest Mutation
  const manualIngestMutation = useMutation({
    mutationFn: (variables: any) => manuallyIngestPost(competitorId, brandId, variables),
    onSuccess: () => {
      setIsManualModalOpen(false);
      // Reset form
      setManualUrl('');
      setManualCaption('');
      setManualLikes(0);
      setManualComments(0);
      setManualShares(0);
      setManualViews(0);
      setManualFormError(null);
      queryClient.invalidateQueries({ queryKey: ['competitor-details', competitorId] });
    },
    onError: (err: any) => {
      setManualFormError(err.message || 'Failed to save manual post');
    }
  });

  // Generate Analysis Mutation
  const analysisMutation = useMutation({
    mutationFn: () => generateCompetitorAnalysis(competitorId, brandId),
    onSuccess: (res) => {
      if (!res.success) {
        setAnalysisError(res.error || 'Failed to generate analysis');
      } else {
        setAnalysisError(null);
        queryClient.invalidateQueries({ queryKey: ['competitor-details', competitorId] });
      }
    },
    onError: (err: any) => {
      setAnalysisError(err.message || 'Error occurred while communicating with model');
    }
  });

  // Apply Recommendation Mutation
  const applyMutation = useMutation({
    mutationFn: (recommendationId: string) => applyRecommendation(recommendationId, brandId),
    onSuccess: (res) => {
      if (!res.success) {
        let msg = '';
        if (res.code === 'STRATEGY_NOT_AVAILABLE') {
          msg = 'Strategy integration is not yet available. The strategy domain consumer is pending implementation.';
        } else if (res.code === 'NO_ACTIVE_STRATEGY') {
          msg = 'No active strategy exists for this brand. Please generate a strategy first.';
        } else if (res.error === 'STRATEGY_LOCKED') {
          msg = 'Cannot apply recommendation: The active strategy is approved and locked.';
        } else {
          msg = res.error || 'Failed to apply recommendation to Strategy.';
        }
        setStrategyNotice(msg);
        toast.error(msg);
        setTimeout(() => setStrategyNotice(null), 8000);
      } else {
        setStrategyNotice(null);
        toast.success('Recommendation successfully applied to Strategy!');
        queryClient.invalidateQueries({ queryKey: ['competitor-details', competitorId] });
      }
    },
    onError: (err: any) => {
      const msg = err.message || 'Error occurred while applying recommendation.';
      setStrategyNotice(msg);
      toast.error(msg);
      setTimeout(() => setStrategyNotice(null), 8000);
    }
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCaption.trim()) {
      setManualFormError('Caption content is required');
      return;
    }
    manualIngestMutation.mutate({
      platform: manualPlatform,
      url: manualUrl,
      publishedAt: new Date(manualPublishedAt).toISOString(),
      captionText: manualCaption,
      likeCount: manualLikes,
      commentCount: manualComments,
      shareCount: manualShares,
      viewCount: manualViews,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        <span className="text-sm text-gray-400">Loading competitor dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <h3 className="text-lg font-bold text-white">Access Denied or Not Found</h3>
        <p className="text-sm text-gray-400 max-w-md">
          This competitor account does not exist or belongs to another brand/organization tenant.
        </p>
        <Link href="/competitors" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm border border-white/10 transition-all">
          Back to Competitors
        </Link>
      </div>
    );
  }

  const { competitor, accounts, posts, recommendations } = data;

  return (
    <div className="space-y-8">
      {/* Strategy Unavailable Notice */}
      {strategyNotice && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-400 animate-in slide-in-from-top duration-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Strategy Integration boundary reached</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{strategyNotice}</p>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <Link href="/competitors" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Competitors</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{competitor.name}</h1>
            {competitor.websiteUrl && (
              <a 
                href={competitor.websiteUrl.startsWith('http') ? competitor.websiteUrl : `https://${competitor.websiteUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-1"
              >
                <span>{competitor.websiteUrl}</span>
                <Plus className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {!isViewer && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Sync All Handles</span>
            </button>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Manual Post</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Instagram/Social Statuses */}
        {['website', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok'].map((platform) => {
          const handle = platform === 'website' ? competitor.websiteUrl : (competitor as any)[platform];
          if (!handle) return null;

          const acc = accounts.find((a) => a.platform.toLowerCase() === platform.toLowerCase());
          const syncStatus = acc?.syncStatus || 'PENDING';
          const lastSynced = acc?.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : 'Never';

          return (
            <div key={platform} className="bg-[#12111A]/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-300">
                    <PlatformIcon platform={platform} className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize">{platform}</h3>
                    <span className="text-xs text-gray-400 truncate max-w-[120px] block">{handle}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  syncStatus === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  syncStatus === 'SYNCING' || syncStatus === 'PENDING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                  syncStatus === 'AUTH_REQUIRED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {syncStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Followers</div>
                  <div className="text-sm font-bold text-white mt-0.5">{acc?.followerCount ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Posts</div>
                  <div className="text-sm font-bold text-white mt-0.5">{acc?.postCount ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Type</div>
                  <div className="text-xs font-semibold text-purple-400 mt-1 uppercase tracking-wide">
                    {acc?.sourceType || (platform === 'website' ? 'PUBLIC_WEB' : 'OFFICIAL_API')}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 text-right">
                Last Synced: <span className="text-gray-400">{lastSynced}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left is Posts, Right is AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Posts Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Competitor Feed</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400 font-semibold">{posts.length}</span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <Globe className="w-10 h-10 text-gray-500" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Ingested Content Yet</h4>
                <p className="text-xs text-gray-400 max-w-sm">
                  Run a website sync or manually enter a post above to populate the feed and begin analyzing.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-[#12111A]/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg hover:border-purple-500/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-300">
                        <PlatformIcon platform={post.platform} className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-purple-400 capitalize">{post.platform}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      post.sourceType === 'MANUAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {post.sourceType}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {post.captionText}
                  </p>

                  {post.url && (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-1"
                    >
                      <span>View post link</span>
                      <Plus className="w-2.5 h-2.5" />
                    </a>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-gray-400 text-xs">
                    <div>Likes: <strong className="text-white">{post.likeCount ?? 0}</strong></div>
                    <div>Comments: <strong className="text-white">{post.commentCount ?? 0}</strong></div>
                    {post.engagementRate !== null && (
                      <div className="ml-auto text-purple-400 font-semibold">
                        Eng. Rate: {post.engagementRate}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Gaps and Strategy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Competitor Analysis</span>
            </h2>

            {!isViewer && (
              <button
                onClick={() => {
                  setAnalysisError(null);
                  analysisMutation.mutate();
                }}
                disabled={analysisMutation.isPending}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${analysisMutation.isPending ? 'animate-pulse' : ''}`} />
                <span>{analysisMutation.isPending ? 'Analyzing...' : 'Run Analysis'}</span>
              </button>
            )}
          </div>

          {/* Analysis Error Alert */}
          {analysisError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-2.5 text-red-400 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Analysis Failed</span>
                <p className="text-gray-400 leading-relaxed">{analysisError}</p>
              </div>
            </div>
          )}

          {recommendations.length === 0 ? (
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Insights Generated Yet</h4>
                <p className="text-xs text-gray-400">
                  Ensure you have active Brand DNA and at least 1 competitor post, then run Analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec: any) => {
                const isApplied = rec.status === 'APPLIED';

                return (
                  <div key={rec.id} className="bg-[#12111A]/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                        {rec.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        Confidence: <strong className="text-white">{(rec.confidence * 100).toFixed(0)}%</strong>
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Observation</h4>
                        <p className="text-sm text-white mt-1 leading-relaxed">{rec.observation}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Likely Cause</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{rec.likelyCause}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommendation</h4>
                        <p className="text-sm font-semibold text-white mt-1 leading-relaxed">{rec.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Action Plan</h4>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{rec.action}</p>
                      </div>
                    </div>

                    {/* Traced Evidence Sources */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Traced Evidence Sources</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(rec.sources) && (rec.sources as any[]).map((src: any, index: number) => {
                          if (src.type === 'BRAND_DNA') {
                            return (
                              <span key={index} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                                {src.label}
                              </span>
                            );
                          }
                          return (
                            <a
                              key={index}
                              href={src.url || '#'}
                              target={src.url ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white text-[10px] font-semibold transition-all inline-flex items-center gap-1"
                            >
                              <span>{src.label}</span>
                              {src.url && <Plus className="w-2 h-2" />}
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    {/* Apply Button */}
                    {!isViewer && (
                      <button
                        onClick={() => applyMutation.mutate(rec.id)}
                        disabled={isApplied || applyMutation.isPending}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isApplied
                            ? 'bg-green-500/10 text-green-400 border border-green-500/25 cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/10'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied to Strategy</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply to Strategy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Ingest Manual Post Dialog Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12111A] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <span>Ingest Competitor Post Manually</span>
              </h2>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
            </div>

            {manualFormError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{manualFormError}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Platform Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform *</label>
                  <select
                    value={manualPlatform}
                    onChange={(e) => setManualPlatform(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="website" className="bg-[#12111A]">Website</option>
                    <option value="instagram" className="bg-[#12111A]">Instagram</option>
                    <option value="linkedin" className="bg-[#12111A]">LinkedIn</option>
                    <option value="twitter" className="bg-[#12111A]">X/Twitter</option>
                    <option value="youtube" className="bg-[#12111A]">YouTube</option>
                    <option value="tiktok" className="bg-[#12111A]">TikTok</option>
                  </select>
                </div>

                {/* Published At Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Published Date *</label>
                  <input
                    type="date"
                    required
                    value={manualPublishedAt}
                    onChange={(e) => setManualPublishedAt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Post URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Post URL (optional)</label>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="e.g. https://www.instagram.com/p/C_abc123"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Caption / Content Text */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption/Content Text *</label>
                  <textarea
                    required
                    rows={4}
                    value={manualCaption}
                    onChange={(e) => setManualCaption(e.target.value)}
                    placeholder="Describe the competitor post content, headlines, keywords, and marketing angles..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Metrics */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Likes</label>
                  <input
                    type="number"
                    min={0}
                    value={manualLikes}
                    onChange={(e) => setManualLikes(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Comments</label>
                  <input
                    type="number"
                    min={0}
                    value={manualComments}
                    onChange={(e) => setManualComments(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm border border-white/10 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualIngestMutation.isPending}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {manualIngestMutation.isPending ? 'Saving...' : 'Save Post'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
