'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  History,
  GitMerge,
  Edit,
  Save,
  ArrowLeft,
  X,
  Search,
  Filter,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Megaphone,
  BookOpen,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllContentItems } from './actions';
import {
  requestContentGeneration,
  retryContentGeneration,
  retryQualityScoring,
  saveContentEdit,
  restoreContentVersion,
  regenerateContentWithInstruction,
  markContentReadyForReview,
  approveContentItem
} from '../calendar/actions';
import {
  requestSEOAnalysis,
  getLatestSEOAnalysis,
  applySEOOptimization
} from '../seo/actions';
import { format } from 'date-fns';

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  format: string;
  type?: string | null;
  scheduledDate: Date;
  funnelStage: string;
  contentPillar: string;
  theme: string | null;
  status: string;
  hook?: string | null;
  cta?: string | null;
  campaign?: string | null;
  aiScore?: number | null;
  reason?: string | null;
  source: string;
  version: number;
  generations?: any[];
  channel?: { id: string; name: string; platform: string; type: string } | null;
}

interface ContentClientProps {
  initialItems: ContentItem[];
  brandName: string;
  brandId: string;
  organizationId: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canGenerate: boolean;
    canAnalyzeSEO: boolean;
    canOptimizeSEO: boolean;
  };
  campaigns?: { id: string; name: string }[];
}

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
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 22 22 22 12 2"></polygon>
        </svg>
      );
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <PlatformIcon platform="instagram" className="w-4 h-4 text-pink-400" />;
    case 'linkedin': return <PlatformIcon platform="linkedin" className="w-4 h-4 text-blue-400" />;
    case 'twitter':
    case 'x': return <PlatformIcon platform="twitter" className="w-4 h-4 text-sky-400" />;
    case 'youtube': return <PlatformIcon platform="youtube" className="w-4 h-4 text-red-500" />;
    default: return <Sparkles className="w-4 h-4 text-purple-400" />;
  }
};

const getFunnelBadgeClass = (stage: string) => {
  switch (stage.toUpperCase()) {
    case 'TOFU': return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
    case 'MOFU': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    case 'BOFU': return 'bg-pink-500/10 border-pink-500/30 text-pink-400';
    default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
  }
};

export default function ContentClient({
  initialItems,
  brandName,
  brandId,
  organizationId,
  permissions,
  campaigns = []
}: ContentClientProps) {
  const queryClient = useQueryClient();

  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [funnelFilter, setFunnelFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [comparingVersionId, setComparingVersionId] = useState<string | null>(null);
  const [showSEOAnalysis, setShowSEOAnalysis] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [regenerationInstruction, setRegenerationInstruction] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isViewer = !permissions.canEdit;

  // --- QUERY ---
  const { data: items = initialItems, isLoading } = useQuery({
    queryKey: ['content-engine-items', organizationId, brandId, platformFilter, funnelFilter],
    queryFn: async () => {
      return getAllContentItems({
        brandId,
        filters: { platform: platformFilter, funnelStage: funnelFilter }
      }) as Promise<ContentItem[]>;
    },
    initialData: initialItems,
    refetchInterval: (query) => {
      const data = query.state.data as ContentItem[];
      const itemsToCheck = data || initialItems;
      const active = itemsToCheck.some(item =>
        item.generations?.some(gen =>
          gen.textStatus === 'QUEUED' || gen.textStatus === 'GENERATING' ||
          gen.imageStatus === 'QUEUED' || gen.imageStatus === 'GENERATING' ||
          gen.videoStatus === 'QUEUED' || gen.videoStatus === 'GENERATING' ||
          gen.scoringStatus === 'SCORING'
        )
      );
      return active ? 3000 : false;
    }
  });

  // Filter items client-side by search and status
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.contentPillar && item.contentPillar.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const generated = items.filter(i => i.status !== 'DRAFT').length;
    const pendingReview = items.filter(i => i.status === 'READY_FOR_REVIEW').length;
    const scheduledOrPublished = items.filter(i => i.status === 'SCHEDULED' || i.status === 'PUBLISHED').length;
    
    // Calculate average quality score from all completed content generations
    let totalScore = 0;
    let scoreCount = 0;
    items.forEach(i => {
      const activeGen = i.generations?.[0];
      if (activeGen?.qualityScore?.composite) {
        totalScore += activeGen.qualityScore.composite;
        scoreCount++;
      }
    });
    const avgQuality = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;

    return { total, generated, pendingReview, scheduledOrPublished, avgQuality };
  }, [items]);

  const latestGen = selectedItem?.generations && selectedItem.generations.length > 0 ? selectedItem.generations[0] : null;

  // Sync selectedItem with fresh query data if it gets updated
  useMemo(() => {
    if (selectedItem) {
      const fresh = items.find(i => i.id === selectedItem.id);
      if (fresh) {
        setSelectedItem(fresh);
      }
    }
  }, [items, selectedItem]);

  const seoQuery = useQuery({
    queryKey: ['seo-analysis-content', latestGen?.id],
    queryFn: () => getLatestSEOAnalysis(latestGen!.id),
    enabled: !!latestGen && showSEOAnalysis,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === 'ANALYZING' ? 3000 : false;
    }
  });

  // --- MUTATIONS ---
  const generateContentMutation = useMutation({
    mutationFn: requestContentGeneration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Generation request failed');
    }
  });

  const retryContentMutation = useMutation({
    mutationFn: ({ generationId, modality }: { generationId: string, modality: 'TEXT' | 'IMAGE' | 'VIDEO' }) => retryContentGeneration(generationId, modality),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Retry request failed');
    }
  });

  const saveEditMutation = useMutation({
    mutationFn: (data: { generationId: string, newContent: string }) => saveContentEdit(data.generationId, data.newContent),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] }); 
      setIsEditing(false); 
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (data: { oldGenId: string, itemId: string }) => restoreContentVersion(data.oldGenId, data.itemId),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] }); 
      setShowVersionHistory(false); 
      setComparingVersionId(null); 
    },
  });

  const regenerateInstructionMutation = useMutation({
    mutationFn: (data: { itemId: string, instruction: string }) => regenerateContentWithInstruction(data.itemId, data.instruction),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] }); 
      setRegenerationInstruction(''); 
    },
  });

  const readyForReviewMutation = useMutation({
    mutationFn: (itemId: string) => markContentReadyForReview(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (data: { itemId: string, genId: string }) => approveContentItem(data.itemId, data.genId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] });
    },
  });

  const analyzeSEOMutation = useMutation({
    mutationFn: (versionId: string) => requestSEOAnalysis(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-analysis-content', latestGen?.id] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'SEO Analysis request failed');
    }
  });

  const optimizeSEOMutation = useMutation({
    mutationFn: ({ versionId, recommendations }: { versionId: string, recommendations: string }) => applySEOOptimization(versionId, recommendations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-engine-items', organizationId, brandId] });
      setShowSEOAnalysis(false);
      setSelectedRecommendations([]);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'SEO Optimization request failed');
    }
  });

  // --- RENDER MODAL ---
  const renderItemModal = () => {
    if (!selectedItem) return null;
    const latestGen = selectedItem.generations && selectedItem.generations.length > 0
      ? [...selectedItem.generations].sort((a: any, b: any) => b.version - a.version)[0]
      : null;

    if (showVersionHistory) {
      const sortedGens = [...(selectedItem.generations || [])].sort((a: any, b: any) => b.version - a.version);
      const compareGen = comparingVersionId ? sortedGens.find((g: any) => g.id === comparingVersionId) : null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12111A] border border-white/10 rounded-2xl p-6 max-w-4xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Version History
              </h3>
              <button onClick={() => { setShowVersionHistory(false); setComparingVersionId(null); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {comparingVersionId && compareGen ? (
              <div className="space-y-4">
                <button onClick={() => setComparingVersionId(null)} className="text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300">
                  <ArrowLeft className="w-3 h-3" /> Back to History
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-2">Version {compareGen.version} (Selected)</h4>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">{compareGen.textContent ? JSON.stringify(compareGen.textContent, null, 2) : 'No content'}</pre>
                  </div>
                  <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/30">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Version {latestGen.version} (Current)</h4>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">{latestGen.textContent ? JSON.stringify(latestGen.textContent, null, 2) : 'No content'}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedGens.map((gen: any, idx: number) => (
                  <div key={gen.id} className={`bg-white/5 border p-4 rounded-xl flex items-center justify-between ${idx === 0 ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Version {gen.version}</span>
                        {idx === 0 && <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                        <span className="text-[10px] text-gray-400 font-mono">{gen.generationSource || 'AI_GENERATION'}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(gen.createdAt).toLocaleString()}</span>
                        {gen.qualityScore && <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-400" /> Score: {gen.qualityScore.composite}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {idx !== 0 && (
                        <button onClick={() => setComparingVersionId(gen.id)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5">
                          <GitMerge className="w-3 h-3" /> Compare
                        </button>
                      )}
                      {idx !== 0 && !isViewer && (
                        <button onClick={() => { if (confirm('Restore this version? This creates a new version from this content. This will not overwrite history.')) restoreMutation.mutate({ oldGenId: gen.id, itemId: selectedItem.id }) }} className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-1.5">
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#12111A] border border-white/10 rounded-2xl p-6 max-w-3xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Scheduled: {new Date(selectedItem.scheduledDate).toLocaleString()}
              </span>
              <h3 className="text-xl font-bold text-white leading-snug pr-8">{selectedItem.title}</h3>
            </div>
            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white text-lg font-semibold bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">✕</button>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-1 bg-white/5 rounded-lg text-gray-300 font-semibold uppercase">{selectedItem.platform}</span>
            <span className="px-2 py-1 bg-white/5 rounded-lg text-gray-300">{selectedItem.format}</span>
            <span className={`px-2 py-1 rounded-lg uppercase font-semibold ${selectedItem.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : selectedItem.status === 'READY_FOR_REVIEW' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'}`}>{selectedItem.status}</span>
            {latestGen && <button onClick={() => setShowVersionHistory(true)} className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg flex items-center gap-1"><History className="w-3 h-3" /> Version History</button>}
            {latestGen && permissions.canAnalyzeSEO && <button onClick={() => setShowSEOAnalysis(true)} className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-1"><Filter className="w-3 h-3" /> SEO</button>}
          </div>

          {showSEOAnalysis && latestGen && (
            <div className="bg-[#0B0A11]/60 border border-emerald-500/20 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-400" />
                    SEO Intelligence
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Version {latestGen.version}</p>
                </div>
                <button onClick={() => setShowSEOAnalysis(false)} className="text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold">
                  Back to Content
                </button>
              </div>

              {!seoQuery.data && !seoQuery.isLoading && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <p className="text-sm text-gray-400">No SEO analysis found for this version.</p>
                  <button
                    disabled={analyzeSEOMutation.isPending}
                    onClick={() => analyzeSEOMutation.mutate(latestGen.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-2"
                  >
                    {analyzeSEOMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze SEO
                  </button>
                </div>
              )}

              {seoQuery.isLoading || (seoQuery.data && seoQuery.data.status === 'ANALYZING') ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm text-emerald-400 font-medium">Running SEO Analysis...</p>
                </div>
              ) : null}

              {seoQuery.data && seoQuery.data.status === 'FAILED' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <p className="text-sm text-red-400 font-medium">SEO Analysis Failed</p>
                  <button
                    disabled={analyzeSEOMutation.isPending}
                    onClick={() => analyzeSEOMutation.mutate(latestGen.id)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {seoQuery.data && seoQuery.data.status === 'COMPLETED' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Composite Score</div>
                      <div className={`text-3xl font-bold ${seoQuery.data.seoScore! >= 80 ? 'text-emerald-400' : seoQuery.data.seoScore! >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {seoQuery.data.seoScore}
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Search Intent</div>
                      <div className="text-sm font-semibold text-white uppercase">{seoQuery.data.searchIntent}</div>
                    </div>
                    {(seoQuery.data.keywordData as any)?.primaryThemes && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
                        <div className="text-[10px] text-gray-400 font-semibold uppercase mb-2">Primary Themes</div>
                        <div className="flex flex-wrap gap-2">
                          {((seoQuery.data.keywordData as any).primaryThemes as string[]).map((theme, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded uppercase font-semibold">{theme}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {((seoQuery.data.keywordData as any)?.missingEntities?.length > 0 || (seoQuery.data.keywordData as any)?.stuffedKeywords?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {((seoQuery.data.keywordData as any)?.missingEntities?.length > 0) && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <div className="text-xs text-blue-400 font-semibold mb-2">Missing Entities</div>
                          <ul className="list-disc list-inside text-xs text-blue-300/80 space-y-1">
                            {((seoQuery.data.keywordData as any).missingEntities as string[]).map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        </div>
                      )}
                      {((seoQuery.data.keywordData as any)?.stuffedKeywords?.length > 0) && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <div className="text-xs text-red-400 font-semibold mb-2">Stuffed Keywords</div>
                          <ul className="list-disc list-inside text-xs text-red-300/80 space-y-1">
                            {((seoQuery.data.keywordData as any).stuffedKeywords as string[]).map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {(seoQuery.data.recommendations as any[])?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <h5 className="text-sm font-semibold text-white">Recommendations</h5>
                        {permissions.canOptimizeSEO && (
                          <button
                            disabled={selectedRecommendations.length === 0 || optimizeSEOMutation.isPending}
                            onClick={() => {
                              const recsText = selectedRecommendations.map(r => r.suggestedAction).join('\n');
                              optimizeSEOMutation.mutate({ versionId: latestGen.id, recommendations: recsText });
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            {optimizeSEOMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Optimize Selected
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {(seoQuery.data.recommendations as any[]).map((rec, i) => {
                          const isSelected = selectedRecommendations.includes(rec);
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                if (isSelected) setSelectedRecommendations(prev => prev.filter(r => r !== rec));
                                else setSelectedRecommendations(prev => [...prev, rec]);
                              }}
                              className={`p-3 rounded-xl border ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'} cursor-pointer transition-colors`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-white/20 bg-black/40'}`}>
                                  {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{rec.category}</span>
                                    <span className={`text-[10px] font-bold uppercase ${rec.severity === 'HIGH' ? 'text-red-400' : rec.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>{rec.severity} PRIORITY</span>
                                  </div>
                                  <p className="text-xs text-white font-medium mb-1">{rec.suggestedAction}</p>
                                  <p className="text-[10px] text-gray-400">{rec.explanation}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!latestGen && !showSEOAnalysis && (
            <div className="bg-[#0B0A11]/60 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-gray-400">No content has been generated for this item yet.</p>
              {!isViewer && (
                <button
                  onClick={() => generateContentMutation.mutate(selectedItem.id)}
                  disabled={generateContentMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-2"
                >
                  {generateContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Content
                </button>
              )}
            </div>
          )}

          {latestGen && latestGen.textContent && !showSEOAnalysis && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-white">Generated Content</h4>
                {!isViewer && (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setIsEditing(false)} className="text-xs px-3 py-1.5 text-gray-400 hover:text-white">Cancel</button>
                        <button disabled={saveEditMutation.isPending} onClick={() => saveEditMutation.mutate({ generationId: latestGen.id, newContent: editContent })} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5">
                          <Save className="w-3 h-3" /> Save
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setEditContent(typeof latestGen.textContent === 'string' ? latestGen.textContent : JSON.stringify(latestGen.textContent, null, 2)); setIsEditing(true); }} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <div className="bg-[#0B0A11]/60 border border-white/5 rounded-xl p-4">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">
                    {typeof latestGen.textContent === 'string' ? latestGen.textContent :
                      Object.entries(latestGen.textContent).map(([k, v]) => v ? `[${k.toUpperCase()}]\n${v}\n\n` : '').join('') || JSON.stringify(latestGen.textContent, null, 2)}
                  </pre>
                </div>
              )}

              {/* AI Instruction / Regeneration */}
              {!isEditing && !isViewer && (
                <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                  <input
                    type="text"
                    value={regenerationInstruction}
                    onChange={(e) => setRegenerationInstruction(e.target.value)}
                    placeholder="Tell AI how you want this version changed (e.g. 'Make it shorter')..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white placeholder:text-purple-300/50"
                  />
                  <button
                    disabled={regenerateInstructionMutation.isPending || !regenerationInstruction}
                    onClick={() => regenerateInstructionMutation.mutate({ itemId: selectedItem.id, instruction: regenerationInstruction })}
                    className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg whitespace-nowrap"
                  >
                    {regenerateInstructionMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 text-xs">
                  {latestGen.qualityScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Quality</span>
                      <span className={`text-sm font-bold ${latestGen.qualityScore.composite >= 90 ? 'text-emerald-400' : latestGen.qualityScore.composite >= 75 ? 'text-blue-400' : 'text-yellow-400'}`}>{latestGen.qualityScore.composite}</span>
                    </div>
                  )}
                  {latestGen.scoringStatus === 'SCORING' && <div className="text-[10px] text-blue-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Scoring...</div>}
                </div>
                <div className="flex items-center gap-3">
                  {!isViewer && selectedItem.status === 'DRAFT' && (
                    <button disabled={readyForReviewMutation.isPending} onClick={() => readyForReviewMutation.mutate(selectedItem.id)} className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20">
                      Ready for Review
                    </button>
                  )}

                  {latestGen.approvals && latestGen.approvals.some((a: any) => a.status === 'APPROVED') ? (
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Approved</span>
                      {selectedItem.channel?.id ? (
                        <>
                          <button onClick={() => {
                            const dateStr = prompt("Enter scheduled time (YYYY-MM-DDTHH:mm)", format(new Date(selectedItem.scheduledDate), "yyyy-MM-dd'T'HH:mm"));
                            if (dateStr) {
                              const d = new Date(dateStr);
                              if (!isNaN(d.getTime())) {
                                import('../publishing/actions').then(m => {
                                  m.scheduleContent(selectedItem.id, latestGen.id, selectedItem.channel!.id, d)
                                    .then(() => alert("Scheduled successfully!"))
                                    .catch(e => alert(e.message));
                                });
                              } else {
                                alert("Invalid date");
                              }
                            }
                          }} className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium">
                            Schedule
                          </button>
                          <button onClick={() => {
                            if (confirm("Are you sure you want to publish this immediately?")) {
                              import('../publishing/actions').then(m => {
                                m.publishContent(selectedItem.id, latestGen.id, selectedItem.channel!.id)
                                  .then(() => alert("Publish job queued successfully!"))
                                  .catch(e => alert(e.message));
                              });
                            }
                          }} className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium">
                            Publish Now
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-yellow-400">Assign a channel first</span>
                      )}
                    </div>
                  ) : selectedItem.status === 'READY_FOR_REVIEW' && !isViewer ? (
                    <button
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate({ itemId: selectedItem.id, genId: latestGen.id })}
                      className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                      {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Awaiting approval</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Content Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage, generate, and optimize all AI marketing content for <span className="text-purple-400 font-semibold">{brandName}</span>.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Items</div>
          <div className="text-2xl font-bold text-white">{metrics.total}</div>
        </div>
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">AI Generated</div>
          <div className="text-2xl font-bold text-purple-400">{metrics.generated}</div>
        </div>
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Pending Review</div>
          <div className="text-2xl font-bold text-blue-400">{metrics.pendingReview}</div>
        </div>
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Active Pipeline</div>
          <div className="text-2xl font-bold text-emerald-400">{metrics.scheduledOrPublished}</div>
        </div>
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Avg Quality</div>
          <div className="text-2xl font-bold text-yellow-400">
            {metrics.avgQuality !== null ? `${metrics.avgQuality}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-300 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-semibold text-rose-400 hover:text-rose-300">Dismiss</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search content or pillars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0B0A11]/60 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer flex-1 md:flex-none">
            <option value="ALL">All Platforms</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TWITTER">Twitter/X</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer flex-1 md:flex-none">
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="READY_FOR_REVIEW">Ready for Review</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PUBLISHED">Published</option>
          </select>

          <select value={funnelFilter} onChange={(e) => setFunnelFilter(e.target.value)} className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer flex-1 md:flex-none">
            <option value="ALL">All Stages</option>
            <option value="TOFU">TOFU (Reach)</option>
            <option value="MOFU">MOFU (Trust)</option>
            <option value="BOFU">BOFU (Action)</option>
          </select>
        </div>
      </div>

      {/* List Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Loading content items...</p>
        </div>
      ) : (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0B0A11]/30 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Content Concept</th>
                  <th className="py-4 px-6">Scheduled Date</th>
                  <th className="py-4 px-6">Platform</th>
                  <th className="py-4 px-6">Funnel Stage</th>
                  <th className="py-4 px-6">Generations</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No content items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const itemGen = item.generations?.[0];
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors text-white">
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-semibold truncate text-sm">{item.title}</div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5">Pillar: {item.contentPillar}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-300 whitespace-nowrap">
                          {format(new Date(item.scheduledDate), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 capitalize font-medium">
                            {getPlatformIcon(item.platform)}
                            {item.platform}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${getFunnelBadgeClass(item.funnelStage)}`}>
                            {item.funnelStage}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {itemGen ? (
                            <div className="flex gap-2 items-center text-[10px]">
                              <span className={`flex items-center gap-1 font-semibold ${itemGen.textStatus === 'COMPLETED' ? 'text-emerald-400' : itemGen.textStatus === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                                T: {itemGen.textStatus}
                              </span>
                              {itemGen.qualityScore && (
                                <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.2 rounded font-bold">
                                  {itemGen.qualityScore.composite}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-[10px] italic">No generation yet</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.status === 'PUBLISHED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                            item.status === 'SCHEDULED' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' :
                            item.status === 'READY_FOR_REVIEW' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' :
                            'bg-gray-500/10 border border-gray-500/30 text-gray-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Open in Studio
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {renderItemModal()}
    </div>
  );
}
