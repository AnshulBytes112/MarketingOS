'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Globe,
  Building2,
  Layers,
  ShieldAlert,
  Users,
  Target,
  Trash2,
  FileText,
  FileImage,
  RefreshCw,
  Loader2,
  File,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssets, deleteAssetAction, getAssetPreviewUrl, enqueueAssetExtraction, getBrandDna, regenerateBrandDna } from './actions';
import { toast } from 'react-hot-toast';

interface BrandData {
  id: string;
  name: string;
  industry: string;
  geography: string;
  priceSegment: string;
  websiteUrl: string;
  positioning: string;
  usp: string;
  targetAudience: string;
}

interface AssetData {
  id: string;
  type: string;
  url: string;
  fileName: string | null;
  size: number | null;
  extractionStatus: string | null;
  createdAt: Date;
}

export default function BrandIntelligenceClient({ brand }: { brand: BrandData }) {
  const [activeTab, setActiveTab] = useState<'dna' | 'voice' | 'audience' | 'assets' | 'guidelines'>('dna');
  const [page, setPage] = useState(1);
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  
  const { data: brandDna, isLoading: isLoadingDna } = useQuery({
    queryKey: ['brand-dna', brand.id],
    queryFn: () => getBrandDna(brand.id),
    refetchInterval: (query) => {
      // Poll every 3 seconds if GENERATING
      return query.state.data?.status === 'GENERATING' ? 3000 : false;
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateBrandDna(brand.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-dna', brand.id] });
      toast.success('Regeneration started');
    },
    onError: () => toast.error('Failed to start regeneration'),
  });

  const handleRegenerate = () => {
    if (confirm('Are you sure you want to regenerate the Brand DNA? This will create a new version based on your latest inputs and assets.')) {
      regenerateMutation.mutate();
    }
  };

  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['brand-assets', brand.id, page, assetTypeFilter],
    queryFn: () => getAssets(brand.id, page, 10, assetTypeFilter || undefined),
    enabled: activeTab === 'assets',
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: string) => deleteAssetAction(assetId),
    onMutate: async (assetId) => {
      await queryClient.cancelQueries({ queryKey: ['brand-assets', brand.id] });
      const previousAssets = queryClient.getQueryData(['brand-assets', brand.id, page, assetTypeFilter]);
      
      queryClient.setQueryData(['brand-assets', brand.id, page, assetTypeFilter], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          assets: old.assets.filter((a: any) => a.id !== assetId),
        };
      });
      return { previousAssets };
    },
    onError: (err, assetId, context) => {
      queryClient.setQueryData(['brand-assets', brand.id, page, assetTypeFilter], context?.previousAssets);
      toast.error('Failed to delete asset');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets', brand.id] });
    },
  });

  const handleUploadClick = () => {
    document.getElementById('asset-upload-input')?.click();
  };

  const handleReplaceClick = (assetId: string) => {
    const input = document.getElementById('asset-replace-input') as HTMLInputElement;
    if (input) {
      input.dataset.replaceId = assetId;
      input.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, replaceId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const toastId = toast.loading(replaceId ? 'Replacing asset...' : 'Uploading asset...');
      
      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brand.id,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          ...(replaceId ? { replaceAssetId: replaceId } : {}),
        }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, asset } = await res.json();

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (file.type === 'application/pdf') {
        await enqueueAssetExtraction(asset.id, brand.id);
      }

      await queryClient.invalidateQueries({ queryKey: ['brand-assets', brand.id] });
      toast.success(replaceId ? 'Asset replaced successfully' : 'Asset uploaded successfully', { id: toastId });
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload asset');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handlePreview = async (assetId: string) => {
    try {
      const res = await getAssetPreviewUrl(assetId);
      window.open(res.url, '_blank');
    } catch (err) {
      toast.error('Failed to generate preview URL');
    }
  };

  // Content Pillars
  const contentPillars = [
    { name: 'Education', percentage: 30, color: 'bg-purple-500', textColor: 'text-purple-400' },
    { name: 'Product', percentage: 25, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { name: 'Sustainability', percentage: 20, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { name: 'Culture', percentage: 15, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { name: 'Community', percentage: 10, color: 'bg-rose-500', textColor: 'text-rose-400' },
  ];

  // Avoid List
  const avoidList = [
    'Excessive emojis',
    'Aggressive sales language',
    'Unverified health claims',
    'Slang',
  ];

  // Voice & Tone data
  const personalityTags = ['Authentic', 'Innovative', 'Sustainable', 'Sophisticated', 'Approachable'];
  const toneAttributes = ['Warm', 'Expert', 'Conversational', 'Inspiring'];

  // Audience demographics
  const audienceDemographics = [
    { range: 'Age 25-34', percentage: 48, color: 'bg-purple-500', textColor: 'text-purple-400' },
    { range: 'Age 35-44', percentage: 32, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { range: 'Age 18-24', percentage: 12, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { range: 'Age 45+', percentage: 8, color: 'bg-amber-500', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            {brand.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{brand.name}</h1>
            <p className="text-xs text-gray-400 mt-1">
              {brand.industry} · {brand.geography} · {brand.priceSegment}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            id="asset-upload-input" 
            className="hidden" 
            onChange={(e) => handleFileChange(e)} 
          />
          <input 
            type="file" 
            id="asset-replace-input" 
            className="hidden" 
            onChange={(e) => {
              const replaceId = (e.target as any).dataset.replaceId;
              handleFileChange(e, replaceId);
            }} 
          />
          <button 
            onClick={handleUploadClick}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-gray-400" />
            <span>Upload Asset</span>
          </button>

          <button 
            onClick={handleRegenerate}
            disabled={brandDna?.status === 'GENERATING' || regenerateMutation.isPending}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30"
          >
            {brandDna?.status === 'GENERATING' || regenerateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{brandDna?.status === 'GENERATING' ? 'Generating...' : 'Regenerate DNA'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-[#12111A]/60 border border-white/5 p-1.5 rounded-xl w-fit">
        {[
          { key: 'dna', label: 'Brand DNA' },
          { key: 'voice', label: 'Voice & Tone' },
          { key: 'audience', label: 'Audience' },
          { key: 'assets', label: 'Assets' },
          { key: 'guidelines', label: 'Guidelines' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'dna' | 'voice' | 'audience' | 'assets' | 'guidelines')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BRAND DNA */}
      {activeTab === 'dna' && (
        <div className="space-y-6 animate-in fade-in">
          {brandDna?.status === 'FAILED' && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-sm flex justify-between items-center">
              <span>Generation failed. Please try again.</span>
              <button onClick={handleRegenerate} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium">Retry Generation</button>
            </div>
          )}

          {(!brandDna || brandDna.status === 'GENERATING' || isLoadingDna) && brandDna?.status !== 'FAILED' ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <h3 className="text-white font-medium mb-1">
                {brandDna?.status === 'GENERATING' ? 'Analyzing your brand intelligence...' : 'Loading Brand DNA...'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md text-center">
                We are processing your inputs, products, competitors, and extracted documents to generate a tailored brand strategy.
              </p>
            </div>
          ) : brandDna?.status === 'COMPLETED' ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Core Identity */}
                <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">Core Identity</h3>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                      <span className="text-gray-400">Industry</span>
                      <span className="font-medium text-white">{brand.industry}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                      <span className="text-gray-400">Geography</span>
                      <span className="font-medium text-white">{brand.geography}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                      <span className="text-gray-400">Price Segment</span>
                      <span className="font-medium text-white">{brand.priceSegment}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                      <span className="text-gray-400">Website</span>
                      <span className="font-medium text-white">{brand.websiteUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Sources & Confidence */}
                <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <h3 className="text-base font-semibold text-white">Sources & Confidence</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      Confidence: {brandDna.confidenceScore || 0}%
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ingested Sources</h4>
                    {(brandDna.sources as string[] || []).map((source, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
                        <span className="text-emerald-400">✓</span> {source}
                      </div>
                    ))}
                    {(!brandDna.sources || (brandDna.sources as string[]).length === 0) && (
                      <p className="text-xs text-gray-500 italic">No sources recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Positioning & USP */}
                <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">Positioning & Tone</h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Positioning Statement
                      </h4>
                      <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                        {brandDna.positioning || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Brand Tone
                      </h4>
                      <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                        {brandDna.tone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Pillars */}
                <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">Content Pillars</h3>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {((brandDna.contentPillars as any[]) || []).map((pillar: any, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-300">{pillar.name}</span>
                          <span className={`font-semibold ${pillar.textColor}`}>{pillar.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#1C1A2B] h-2 rounded-full overflow-hidden">
                          <div
                            className={`${pillar.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pillar.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {(!brandDna.contentPillars || (brandDna.contentPillars as any[]).length === 0) && (
                      <p className="text-xs text-gray-500 italic">No content pillars defined.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand Guidelines & Avoid List */}
              <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-semibold text-white">Brand Guidelines & Avoid List</h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Do Not Use
                  </h4>
                  <div className="space-y-2">
                    {((brandDna.avoidList as string[]) || []).map((item, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: VOICE & TONE */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Brand Personality & Tone Attributes */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Brand Personality</h3>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {personalityTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <h3 className="text-base font-semibold text-white">Voice Description</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {brandDna?.voice || 'Not generated yet.'}
              </p>
            </div>
          </div>

          {/* Sample Brand Voice */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Sample Brand Voice</h3>

            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Brand Personality
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed italic">
                  {brandDna?.personality || 'Not generated yet.'}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Language Elements
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                  {brandDna?.language || 'Not generated yet.'}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  CTA Preferences
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-purple-300 font-medium">
                  {brandDna?.ctaPreferences || 'Not generated yet.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE */}
      {activeTab === 'audience' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          {/* Target Audience */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Target Audience</h3>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  AI Analyzed Audience Profile
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200">
                  {brandDna?.audience || 'Not generated yet.'}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Key Claims
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {((brandDna?.claims as string[]) || []).map((claim, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                    >
                      {claim}
                    </span>
                  ))}
                  {(!brandDna?.claims || (brandDna.claims as string[]).length === 0) && (
                    <span className="text-xs text-gray-500 italic">No claims generated.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Audience Demographics</h3>

            <div className="space-y-4 pt-2">
              {((brandDna?.contentPillars as any[]) || []).map((demo: any, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-300">{demo.name}</span>
                    <span className={`font-semibold ${demo.textColor}`}>{demo.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#1C1A2B] h-2 rounded-full overflow-hidden">
                    <div
                      className={`${demo.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${demo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!brandDna?.contentPillars || (brandDna.contentPillars as any[]).length === 0) && (
                <p className="text-xs text-gray-500 italic">No content pillar breakdown available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSETS */}
      {activeTab === 'assets' && (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-base font-semibold text-white">Brand Assets Studio</h3>
            <div className="flex gap-2">
              <select 
                className="bg-[#0B0A11] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="image/png">Images</option>
                <option value="application/pdf">PDF Documents</option>
              </select>
              <button 
                onClick={handleUploadClick}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Asset
              </button>
            </div>
          </div>

          {isLoadingAssets ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : !assetsData?.assets?.length ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl">
              <File className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm">No assets found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {assetsData.assets.map((asset: AssetData) => (
                <div key={asset.id} className="rounded-xl overflow-hidden border border-white/10 bg-[#0B0A11] p-3 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="h-32 bg-[#1C1A2B] rounded-lg mb-2 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative" onClick={() => handlePreview(asset.id)}>
                      {asset.type.startsWith('image/') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <FileImage className="w-8 h-8 mb-1" />
                          <span className="text-xs">Click to view image</span>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <FileText className="w-8 h-8 mx-auto mb-1" />
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md">PDF</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-medium text-white truncate" title={asset.fileName || asset.id}>
                      {asset.fileName || 'Unnamed Asset'}
                    </div>
                    <div className="text-[10px] text-gray-500 flex justify-between items-center mt-1">
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      {asset.size && <span>{(asset.size / 1024).toFixed(0)} KB</span>}
                    </div>
                    {asset.extractionStatus && (
                      <div className={`mt-2 text-[10px] px-2 py-1 rounded inline-block ${
                        asset.extractionStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        asset.extractionStatus === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {asset.extractionStatus === 'PROCESSING' ? (
                          <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Extracting Text...</span>
                        ) : asset.extractionStatus === 'PENDING' ? (
                          'Pending Extraction'
                        ) : asset.extractionStatus === 'FAILED' ? (
                          'Extraction Failed'
                        ) : (
                          'Text Extracted'
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleReplaceClick(asset.id)}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Replace
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this asset?')) {
                          deleteAssetMutation.mutate(asset.id);
                        }
                      }}
                      className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-medium flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {assetsData?.metadata && assetsData.metadata.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-white/5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white/5 rounded text-xs text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-400 flex items-center">
                Page {page} of {assetsData.metadata.totalPages}
              </span>
              <button 
                disabled={page >= assetsData.metadata.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white/5 rounded text-xs text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6 animate-in fade-in">
          <h3 className="text-base font-semibold text-white">Brand Guidelines</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-[#181624]/70 border border-white/5 space-y-2">
              <h4 className="text-xs font-semibold text-purple-400">Visual Identity Summary</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {brandDna?.visualIdentitySummary || 'Not generated yet.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
