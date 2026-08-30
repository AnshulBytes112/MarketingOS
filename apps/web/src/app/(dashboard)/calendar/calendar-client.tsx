'use client';

import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Filter,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  History,
  GitMerge,
  Edit,
  Save,
  ArrowLeft,
  X
} from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContentItems, rescheduleContentItem, bulkUpdateContentItems, createContentItem, requestContentGeneration, retryContentGeneration, retryQualityScoring, saveContentEdit, restoreContentVersion, regenerateContentWithInstruction, markContentReadyForReview } from './actions';
import { requestSEOAnalysis, getLatestSEOAnalysis, applySEOOptimization } from '../seo/actions';
import { requestSEOAnalysis, getLatestSEOAnalysis, applySEOOptimization } from '../seo/actions';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

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
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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

interface CalendarClientProps {
  initialItems: ContentItem[];
  brandName: string;
  brandId: string;
  organizationId: string;
  contentPlanId: string;
  strategyId: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canGenerate: boolean;
    canAnalyzeSEO: boolean;
    canOptimizeSEO: boolean;
  };
  initialStartDate: string;
  initialEndDate: string;
  campaigns?: { id: string; name: string }[];
  selectedCampaignId?: string;
}

// Helpers
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

const getFunnelLabel = (stage: string) => {
  switch (stage.toUpperCase()) {
    case 'TOFU': return 'Reach New People';
    case 'MOFU': return 'Build Interest & Trust';
    case 'BOFU': return 'Drive Action';
    default: return stage;
  }
};

// --- DRAGGABLE ITEM ---
function DraggableContentCard({ 
  item, 
  onClick, 
  isSelected, 
  onSelectToggle,
  isViewer 
}: { 
  item: ContentItem; 
  onClick: () => void; 
  isSelected: boolean; 
  onSelectToggle: () => void;
  isViewer: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
    disabled: isViewer,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#12111A]/90 border ${isSelected ? 'border-purple-500' : 'border-white/5 hover:border-purple-500/40'} rounded-2xl p-5 space-y-4 transition-all duration-300 relative group flex flex-col justify-between ${isDragging ? 'shadow-2xl shadow-purple-500/20' : ''}`}
    >
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {!isViewer && (
          <div 
            className="w-5 h-5 rounded border border-white/20 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); onSelectToggle(); }}
          >
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
          </div>
        )}
      </div>

      <div 
        className="space-y-3 cursor-pointer h-full flex flex-col" 
        onClick={onClick}
        {...listeners} 
        {...attributes}
      >
        <div className="flex justify-between items-center gap-2 pr-8">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(item.scheduledDate), 'h:mm a')}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${item.status === 'PUBLISHED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : item.status === 'SCHEDULED' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'}`}>
            {item.status}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mt-1">
          {item.title}
        </h3>

        <div className="flex-1" />

        <div className="space-y-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-white">
              {getPlatformIcon(item.platform)}
              <span className="capitalize">{item.platform}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${getFunnelBadgeClass(item.funnelStage)}`}>
              {getFunnelLabel(item.funnelStage)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-gray-400 line-clamp-1">
              <span className="font-semibold text-purple-400">Pillar: </span>
              {item.contentPillar}
            </div>
            {item.source === 'MANUAL' && (
              <span className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded">MANUAL</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- DROPPABLE ROW ---
function DroppableDateRow({ date, items, selectedIds, onSelectItem, onOpenItem, isViewer }: { 
  date: Date; 
  items: ContentItem[]; 
  selectedIds: Set<string>;
  onSelectItem: (id: string) => void;
  onOpenItem: (item: ContentItem) => void;
  isViewer: boolean;
}) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({ id: dateStr });

  return (
    <div ref={setNodeRef} className={`mb-8 rounded-2xl p-4 transition-colors ${isOver ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-transparent border border-transparent'}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {format(date, 'EEEE, MMM do')}
          {isSameDay(date, new Date()) && <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full text-white">Today</span>}
        </h3>
        <span className="text-xs text-gray-500">{items.length} post{items.length !== 1 ? 's' : ''}</span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-xl bg-white/5 opacity-50">
          <p className="text-xs text-gray-500">No content scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <DraggableContentCard 
              key={item.id} 
              item={item} 
              isSelected={selectedIds.has(item.id)}
              onSelectToggle={() => onSelectItem(item.id)}
              onClick={() => onOpenItem(item)}
              isViewer={isViewer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarClient({ 
  initialItems, 
  brandName, 
  brandId, 
  organizationId,
  contentPlanId, 
  strategyId, 
  permissions,
  initialStartDate,
  initialEndDate,
  campaigns = [],
  selectedCampaignId = '',
}: CalendarClientProps) {
  const queryClient = useQueryClient();
  const router = require('next/navigation').useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  
  const [currentStart, setCurrentStart] = useState(new Date(initialStartDate));
  const [currentEnd, setCurrentEnd] = useState(new Date(initialEndDate));
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [comparingVersionId, setComparingVersionId] = useState<string | null>(null);
  const [regenerationInstruction, setRegenerationInstruction] = useState('');
  const [showSEOAnalysis, setShowSEOAnalysis] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<any[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isViewer = !permissions.canEdit;

  // --- QUERY ---
  const { data: items = initialItems, isLoading } = useQuery({
    queryKey: ['content-items', organizationId, brandId, currentStart.toISOString(), currentEnd.toISOString(), platformFilter, funnelFilter],
    queryFn: async () => {
      return getContentItems({
        brandId,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
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

  const latestGen = selectedItem?.generations && selectedItem.generations.length > 0 ? selectedItem.generations[0] : null;

  const seoQuery = useQuery({
    queryKey: ['seo-analysis', latestGen?.id],
    queryFn: () => getLatestSEOAnalysis(latestGen!.id),
    enabled: !!latestGen && showSEOAnalysis,
    refetchInterval: (query) => {
      const data = query.state.data as any;
      return data?.status === 'ANALYZING' ? 3000 : false;
    }
  });

  // --- MUTATIONS ---
  const rescheduleMutation = useMutation({
    mutationFn: rescheduleContentItem,
    onMutate: async (newInfo) => {
      // Optimistic update
      const qKey = ['content-items', brandId, currentStart.toISOString(), currentEnd.toISOString(), platformFilter, funnelFilter];
      await queryClient.cancelQueries({ queryKey: qKey });
      
      const previousItems = queryClient.getQueryData<ContentItem[]>(qKey);
      
      queryClient.setQueryData<ContentItem[]>(qKey, (old) => {
        if (!old) return [];
        return old.map(item => 
          item.id === newInfo.contentItemId 
            ? { ...item, scheduledDate: new Date(newInfo.newScheduledDate) }
            : item
        );
      });
      
      return { previousItems, qKey };
    },
    onError: (err, newInfo, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(context.qKey, context.previousItems);
      }
      setErrorMsg(err.message || 'Failed to reschedule item.');
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: context?.qKey });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateContentItems,
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['content-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Bulk update failed');
    }
  });

  const generateContentMutation = useMutation({
    mutationFn: requestContentGeneration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Generation request failed');
    }
  });

  const retryContentMutation = useMutation({
    mutationFn: ({ generationId, modality }: { generationId: string, modality: 'TEXT' | 'IMAGE' | 'VIDEO' }) => retryContentGeneration(generationId, modality),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Retry request failed');
    }
  });

  
  const saveEditMutation = useMutation({
    mutationFn: (data: { generationId: string, newContent: string }) => saveContentEdit(data.generationId, data.newContent),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar-items'] }); setIsEditing(false); },
  });

  const restoreMutation = useMutation({
    mutationFn: (data: { oldGenId: string, itemId: string }) => restoreContentVersion(data.oldGenId, data.itemId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar-items'] }); setShowVersionHistory(false); setComparingVersionId(null); },
  });

  const regenerateInstructionMutation = useMutation({
    mutationFn: (data: { itemId: string, instruction: string }) => regenerateContentWithInstruction(data.itemId, data.instruction),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar-items'] }); setRegenerationInstruction(''); },
  });

  const readyForReviewMutation = useMutation({
    mutationFn: (itemId: string) => markContentReadyForReview(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-items'] }),
  });

  const retryQualityMutation = useMutation({
    mutationFn: retryQualityScoring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items', organizationId, brandId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Retry quality request failed');
    }
  });

  const analyzeSEOMutation = useMutation({
    mutationFn: (versionId: string) => requestSEOAnalysis(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-analysis', latestGen?.id] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'SEO Analysis request failed');
    }
  });

  const optimizeSEOMutation = useMutation({
    mutationFn: ({ versionId, recommendations }: { versionId: string, recommendations: string }) => applySEOOptimization(versionId, recommendations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items', organizationId, brandId] });
      setShowSEOAnalysis(false);
      setSelectedRecommendations([]);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'SEO Optimization request failed');
    }
  });

  // --- DRAG LOGIC ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;
    
    const targetDateStr = over.id as string;
    const draggedItemId = active.id as string;
    const item = items.find(i => i.id === draggedItemId);
    
    if (!item) return;

    // Construct a new date keeping the original time
    const oldDateObj = new Date(item.scheduledDate);
    const targetDateObj = new Date(targetDateStr);
    
    targetDateObj.setHours(oldDateObj.getHours());
    targetDateObj.setMinutes(oldDateObj.getMinutes());
    targetDateObj.setSeconds(oldDateObj.getSeconds());
    
    if (oldDateObj.getTime() !== targetDateObj.getTime()) {
      rescheduleMutation.mutate({
        contentItemId: draggedItemId,
        newScheduledDate: targetDateObj.toISOString(),
        brandId,
        version: item.version,
      });
    }
  };

  // --- SELECTION LOGIC ---
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(items.map(i => i.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkStatus = (status: string) => {
    if (selectedIds.size === 0) return;
    bulkUpdateMutation.mutate({
      itemIds: Array.from(selectedIds),
      brandId,
      changes: { status }
    });
  };

  // --- MONTH NAVIGATION ---
  const nextMonth = () => {
    const newStart = startOfMonth(addMonths(currentStart, 1));
    const newEnd = endOfMonth(addMonths(currentStart, 1));
    setCurrentStart(newStart);
    setCurrentEnd(newEnd);
  };

  const prevMonth = () => {
    const newStart = startOfMonth(subMonths(currentStart, 1));
    const newEnd = endOfMonth(subMonths(currentStart, 1));
    setCurrentStart(newStart);
    setCurrentEnd(newEnd);
  };

  const daysInRange = eachDayOfInterval({ start: currentStart, end: currentEnd });

  // --- RENDER HELPERS ---
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
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(gen.createdAt).toLocaleString()}</span>
                        {gen.qualityScore && <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-400"/> Score: {gen.qualityScore.composite}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {idx !== 0 && (
                        <button onClick={() => setComparingVersionId(gen.id)} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5">
                          <GitMerge className="w-3 h-3" /> Compare
                        </button>
                      )}
                      {idx !== 0 && !isViewer && (
                        <button onClick={() => { if(confirm('Restore this version? This creates a new version from this content. This will not overwrite history.')) restoreMutation.mutate({ oldGenId: gen.id, itemId: selectedItem.id }) }} className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-1.5">
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
                {new Date(selectedItem.scheduledDate).toLocaleString()}
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

          {showSEOAnalysis && latestGen ? (
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
                  <p className="text-xs text-gray-400 max-w-sm">This is a deterministic analysis combined with AI semantic reasoning to evaluate search intent and keyword themes.</p>
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
                              const recsText = selectedRecommendations.map(r => r.suggestedAction).join('\\n');
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
                       <button onClick={() => { setEditContent(JSON.stringify(latestGen.textContent, null, 2)); setIsEditing(true); }} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5">
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
                      Object.entries(latestGen.textContent).map(([k, v]) => v ? `[${k.toUpperCase()}]
${v}

` : '').join('') || JSON.stringify(latestGen.textContent, null, 2)}
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
                <div className="flex items-center gap-4">
                  {latestGen.qualityScore && (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-400 uppercase font-semibold">Quality</span>
                       <span className={`text-sm font-bold ${latestGen.qualityScore.composite >= 90 ? 'text-emerald-400' : latestGen.qualityScore.composite >= 75 ? 'text-blue-400' : 'text-yellow-400'}`}>{latestGen.qualityScore.composite}</span>
                    </div>
                  )}
                  {latestGen.scoringStatus === 'SCORING' && <div className="text-[10px] text-blue-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Scoring...</div>}
                </div>
                <div className="flex items-center gap-3">
                  {!isViewer && selectedItem.status === 'DRAFT' && (
                    <button disabled={readyForReviewMutation.isPending} onClick={() => readyForReviewMutation.mutate(selectedItem.id)} className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20">
                      Ready for Review
                    </button>
                  )}
                  
                  {latestGen.approvals && latestGen.approvals.some((a: any) => a.status === 'APPROVED') ? (
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Approved</span>
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
    <div className="space-y-6 pb-24 relative">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" />
            Content Calendar
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Publishing pipeline for <span className="text-purple-400 font-semibold">{brandName}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-[#0B0A11]/60 p-1.5 rounded-xl border border-white/5">
            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-white min-w-[100px] text-center">
              {format(currentStart, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2 bg-[#0B0A11]/60 p-1 rounded-xl border border-white/5">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${view === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>

          {!isViewer && (
             <button onClick={() => alert('Manual creation modal placeholder. Hook this to a real modal and call createContentItem.')} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium flex items-center gap-2">
               <Plus className="w-4 h-4" />
               New Post
             </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-rose-300 text-sm flex justify-between items-center">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-semibold text-rose-400 hover:text-rose-300">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Filter className="w-4 h-4 text-purple-500" />
          <span>Filter:</span>
        </div>

        <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer">
          <option value="ALL">All Platforms</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="TWITTER">Twitter/X</option>
          <option value="YOUTUBE">YouTube</option>
        </select>

        <select value={funnelFilter} onChange={(e) => setFunnelFilter(e.target.value)} className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer">
          <option value="ALL">All Funnel Stages</option>
          <option value="TOFU">Reach New People</option>
          <option value="MOFU">Build Interest & Trust</option>
          <option value="BOFU">Drive Action</option>
        </select>
        
        {campaigns.length > 0 && (
          <select 
            value={selectedCampaignId || ''} 
            onChange={(e) => {
              if (e.target.value) {
                router.push(`/calendar?campaignId=${e.target.value}`);
              } else {
                router.push('/calendar');
              }
            }} 
            className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Calendar Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
           <p className="text-gray-400 text-sm">Loading calendar...</p>
        </div>
      ) : view === 'grid' ? (
        <DndContext id="calendar-dnd-context" onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="space-y-2">
            {daysInRange.map((date) => {
              const dayItems = items.filter(i => isSameDay(new Date(i.scheduledDate), date));
              // Only render rows that have items, or all days if we want a full calendar feel.
              // We'll render all days in the month to allow dropping on empty days.
              return (
                <DroppableDateRow 
                  key={date.toISOString()} 
                  date={date} 
                  items={dayItems} 
                  selectedIds={selectedIds}
                  onSelectItem={toggleSelection}
                  onOpenItem={setSelectedItem}
                  isViewer={isViewer}
                />
              );
            })}
          </div>
        </DndContext>
      ) : (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0B0A11]/30 text-xs text-gray-400 font-semibold">
                  {!isViewer && <th className="py-4 px-6 w-12"><input type="checkbox" onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()} checked={selectedIds.size > 0 && selectedIds.size === items.length} className="rounded border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500" /></th>}
                  <th className="py-4 px-6">Scheduled Date</th>
                  <th className="py-4 px-6">Post Concept</th>
                  <th className="py-4 px-6">Platform</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {items.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-500">No scheduled content found.</td></tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} className={`hover:bg-white/5 transition-colors cursor-pointer text-white ${selectedIds.has(item.id) ? 'bg-purple-500/5' : ''}`}>
                    {!isViewer && (
                      <td className="py-4 px-6">
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelection(item.id)} onClick={e => e.stopPropagation()} className="rounded border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500" />
                      </td>
                    )}
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap" onClick={() => setSelectedItem(item)}>
                      {format(new Date(item.scheduledDate), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="py-4 px-6 font-semibold line-clamp-2 max-w-xs" onClick={() => setSelectedItem(item)}>
                      {item.title}
                    </td>
                    <td className="py-4 px-6" onClick={() => setSelectedItem(item)}>
                      <div className="flex items-center gap-1.5 capitalize">
                        {getPlatformIcon(item.platform)} {item.platform}
                      </div>
                    </td>
                    <td className="py-4 px-6" onClick={() => setSelectedItem(item)}>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${item.status === 'PUBLISHED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && !isViewer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#12111A] border border-purple-500/30 shadow-2xl shadow-purple-500/20 rounded-2xl p-4 flex items-center gap-6 z-40 animate-in slide-in-from-bottom-10">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{selectedIds.size}</span>
            items selected
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <button disabled={bulkUpdateMutation.isPending} onClick={() => handleBulkStatus('SCHEDULED')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors">
              Mark Scheduled
            </button>
            <button disabled={bulkUpdateMutation.isPending} onClick={() => handleBulkStatus('PUBLISHED')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors shadow-lg shadow-emerald-500/20">
              Mark Published
            </button>
            <button disabled={bulkUpdateMutation.isPending} onClick={clearSelection} className="px-3 py-2 text-gray-400 hover:text-white text-xs font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {renderItemModal()}
    </div>
  );
}
