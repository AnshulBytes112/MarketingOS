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
import { getAssets, deleteAssetAction, getAssetPreviewUrl, enqueueAssetExtraction, getBrandDna, getBrandDnaVersions, regenerateBrandDna, publishBrandDnaVersionAction, restoreBrandDnaVersionAction } from './actions';
import { EditableField } from './editable-field';
// import { toast } from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState<'dna' | 'voice' | 'audience' | 'assets' | 'guidelines' | 'history'>('dna');
  const [page, setPage] = useState(1);
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  
  const queryClient = useQueryClient();
  
  const { data: brandDna, isLoading: isLoadingDna } = useQuery({
    queryKey: ['brand-dna', brand.id],
    queryFn: () => getBrandDna(brand.id),
    refetchInterval: (query) => {
      // Poll every 3 seconds if GENERATING
      return query.state.data?.status === 'GENERATING' ? 3000 : false;
    }
  });

  const { data: versionsData } = useQuery({
    queryKey: ['brand-dna-versions', brand.id],
    queryFn: () => getBrandDnaVersions(brand.id),
    refetchInterval: (query) => {
      // Poll every 3 seconds if any version is currently GENERATING
      const hasGenerating = query.state.data?.some((v: any) => v.status === 'GENERATING');
      return hasGenerating ? 3000 : false;
    }
  });

  const latestVersion = versionsData?.[0];
  const latestDraft = latestVersion && latestVersion.status === 'COMPLETED' && latestVersion.publicationStatus === 'DRAFT'
    ? latestVersion
    : null;

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateBrandDna(brand.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-dna', brand.id] });
      queryClient.invalidateQueries({ queryKey: ['brand-dna-versions', brand.id] });
      console.log('Regeneration started');
    },
    onError: () => console.error('Failed to start regeneration'),
  });

  const handleRegenerate = () => {
    if (confirm('Are you sure you want to regenerate the Brand DNA? This will create a new version based on your latest inputs and assets.')) {
      regenerateMutation.mutate();
    }
  };

  const publishMutation = useMutation({
    mutationFn: (versionId: string) => publishBrandDnaVersionAction(brand.id, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-dna', brand.id] });
      queryClient.invalidateQueries({ queryKey: ['brand-dna-versions', brand.id] });
    },
    onError: () => console.error('Failed to publish version'),
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => restoreBrandDnaVersionAction(brand.id, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-dna', brand.id] });
      queryClient.invalidateQueries({ queryKey: ['brand-dna-versions', brand.id] });
    },
    onError: () => console.error('Failed to restore version'),
  });

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
      console.error('Failed to delete asset');
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
      const toastId = 'loading';
      
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

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to get upload URL: ${res.status} ${errText}`);
      }
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
      console.log(replaceId ? 'Asset replaced successfully' : 'Asset uploaded successfully');
      
    } catch (err) {
      console.error(err);
      console.error('Failed to upload asset');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handlePreview = async (assetId: string) => {
    try {
      const res = await getAssetPreviewUrl(assetId);
      window.open(res.url, '_blank');
    } catch (err) {
      console.error('Failed to generate preview URL');
    }
  };



  // Voice & Tone data
  const rawPersonality = brandDna?.personality || 'Authentic, Innovative, Sustainable, Sophisticated, Approachable';
  const personalityTags = rawPersonality.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);

  // Audience demographics
  const audienceDemographics: any[] = brandDna?.demographics as any[] || [];

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

      {/* Draft Alert Banner */}
      {latestDraft && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Unpublished Brand DNA Draft (v{latestDraft.version})</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                A new draft version of your Brand DNA has been generated. Review and publish it to apply it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-white transition-all"
            >
              Compare Changes
            </button>
            <button
              onClick={() => publishMutation.mutate(latestDraft.id)}
              disabled={publishMutation.isPending}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-medium text-white transition-all shadow-lg shadow-amber-600/20 flex items-center gap-1.5"
            >
              {publishMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Publish Draft
            </button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-[#12111A]/60 border border-white/5 p-1.5 rounded-xl w-fit">
        {[
          { key: 'dna', label: 'Brand DNA' },
          { key: 'voice', label: 'Voice & Tone' },
          { key: 'audience', label: 'Customers' },
          { key: 'assets', label: 'Assets' },
          { key: 'guidelines', label: 'Guidelines' },
          { key: 'history', label: 'History & Diff' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
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

          {isLoadingDna || brandDna?.status === 'GENERATING' ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <h3 className="text-white font-medium mb-1">
                {brandDna?.status === 'GENERATING' ? 'Analyzing your brand intelligence...' : 'Loading Brand DNA...'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md text-center">
                We are processing your inputs, products, competitors, and extracted documents to generate a tailored brand strategy.
              </p>
            </div>
          ) : !brandDna ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
              <Sparkles className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-white font-medium mb-1">No Brand DNA Generated Yet</h3>
              <p className="text-gray-400 text-sm max-w-md text-center mb-6">
                Upload your assets, competitors, and brand documents, then click Generate to create your AI-powered brand strategy.
              </p>
              <button 
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {regenerateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate First Brand DNA
              </button>
            </div>
          ) : brandDna.status === 'COMPLETED' ? (
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
                    {((brandDna.sources as any[]) || []).map((source: any, i: number) => {
                      const isStructured = typeof source === 'object' && source !== null;
                      const label = isStructured ? source.label : source;
                      
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
                          <span className="text-emerald-400">✓</span> {label}
                        </div>
                      );
                    })}
                    {(!brandDna?.sources || (brandDna.sources as any[]).length === 0) && (
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
                      <EditableField
                        versionId={brandDna?.id || ''}
                        brandId={brand.id}
                        field="positioning"
                        value={brandDna?.positioning}
                        type="textarea"
                        className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                        renderValue={(val) => <div className="text-xs text-gray-200 leading-relaxed">{val || 'N/A'}</div>}
                      />
                    </div>

                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Brand Tone
                      </h4>
                      <EditableField
                        versionId={brandDna?.id || ''}
                        brandId={brand.id}
                        field="tone"
                        value={brandDna?.tone}
                        type="textarea"
                        className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                        renderValue={(val) => <div className="text-xs text-gray-200 leading-relaxed">{val || 'N/A'}</div>}
                      />
                    </div>
                  </div>
                </div>

                {/* Content Pillars */}
                <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">Content Pillars</h3>
                  </div>

                  <EditableField
                    versionId={brandDna?.id || ''}
                    brandId={brand.id}
                    field="contentPillars"
                    value={brandDna?.contentPillars}
                    type="json"
                    renderValue={(pillars) => (
                      <div className="space-y-3.5 pt-2">
                        {((pillars as any[]) || []).map((pillar: any, i) => (
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
                        {(!pillars || (pillars as any[]).length === 0) && (
                          <p className="text-xs text-gray-500 italic">No content pillars defined.</p>
                        )}
                      </div>
                    )}
                  />
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
                  <EditableField
                    versionId={brandDna?.id || ''}
                    brandId={brand.id}
                    field="avoidList"
                    value={brandDna?.avoidList}
                    type="array"
                    renderValue={(items) => (
                      <div className="space-y-2">
                        {((items as string[]) || []).map((item, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  />
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
              <EditableField
                versionId={brandDna?.id || ''}
                brandId={brand.id}
                field="voice"
                value={brandDna?.voice}
                type="textarea"
                renderValue={(val) => <p className="text-xs text-gray-300 leading-relaxed">{val || 'Not generated yet.'}</p>}
              />
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
                <EditableField
                  versionId={brandDna?.id || ''}
                  brandId={brand.id}
                  field="personality"
                  value={brandDna?.personality}
                  type="textarea"
                  className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                  renderValue={(val) => <div className="text-xs text-gray-200 leading-relaxed italic">{val || 'Not generated yet.'}</div>}
                />
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Language Elements
                </h4>
                <EditableField
                  versionId={brandDna?.id || ''}
                  brandId={brand.id}
                  field="language"
                  value={brandDna?.language}
                  type="textarea"
                  className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                  renderValue={(val) => <div className="text-xs text-gray-200 leading-relaxed">{val || 'Not generated yet.'}</div>}
                />
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  What Action to Drive
                </h4>
                <EditableField
                  versionId={brandDna?.id || ''}
                  brandId={brand.id}
                  field="ctaPreferences"
                  value={brandDna?.ctaPreferences}
                  type="textarea"
                  className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                  renderValue={(val) => <div className="text-xs text-purple-300 font-medium">{val || 'Not generated yet.'}</div>}
                />
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
              <h3 className="text-base font-semibold text-white">Target Customers</h3>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  AI Analyzed Customer Profile
                </h4>
                <EditableField
                  versionId={brandDna?.id || ''}
                  brandId={brand.id}
                  field="audience"
                  value={brandDna?.audience}
                  type="textarea"
                  className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5"
                  renderValue={(val) => <div className="text-xs text-gray-200">{val || 'Not generated yet.'}</div>}
                />
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Key Claims
                </h4>
                <EditableField
                  versionId={brandDna?.id || ''}
                  brandId={brand.id}
                  field="claims"
                  value={brandDna?.claims}
                  type="array"
                  renderValue={(items) => (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {((items as string[]) || []).map((claim, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                        >
                          {claim}
                        </span>
                      ))}
                      {(!items || (items as string[]).length === 0) && (
                        <span className="text-xs text-gray-500 italic">No claims generated.</span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Customer Demographics</h3>

            <div className="space-y-4 pt-2">
              {audienceDemographics.map((demo: any, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-300">{demo.range}</span>
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
              {audienceDemographics.length === 0 && (
                <p className="text-xs text-gray-500 italic">Demographic analysis will be generated automatically after competitor data ingestion.</p>
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
              <EditableField
                versionId={brandDna?.id || ''}
                brandId={brand.id}
                field="visualIdentitySummary"
                value={brandDna?.visualIdentitySummary}
                type="textarea"
                renderValue={(val) => <p className="text-xs text-gray-300 leading-relaxed">{val || 'Not generated yet.'}</p>}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HISTORY & DIFF */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Version History & Real-Time Diff</h3>
            
            {!versionsData || versionsData.length === 0 ? (
              <p className="text-sm text-gray-400">No version history available.</p>
            ) : (
              <div className="space-y-8">
                {versionsData.map((version: any, index: number) => {
                  const previousVersion = versionsData[index + 1];
                  const isCurrent = index === 0;

                  return (
                    <div key={version.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${isCurrent ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400'}`}>
                            v{version.version}
                          </span>
                          <span className="text-sm text-gray-300">
                            {new Date(version.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            <span>Status:</span> 
                            <span className={version.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}>{version.status}</span>
                            {version.publicationStatus === 'ACTIVE' && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold ml-2">ACTIVE</span>
                            )}
                            {version.publicationStatus === 'SUPERSEDED' && (
                              <span className="px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 font-bold ml-2">SUPERSEDED</span>
                            )}
                            {version.publicationStatus === 'DRAFT' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold ml-2">DRAFT</span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-gray-400">
                            Source: {version.source} {version.restoredFromVersionId && `(from ${version.restoredFromVersionId})`}
                          </div>

                          <div className="flex gap-2 mt-1">
                            {version.status === 'COMPLETED' && version.publicationStatus !== 'ACTIVE' && (
                              <button 
                                onClick={() => publishMutation.mutate(version.id)}
                                disabled={publishMutation.isPending}
                                className="px-3 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 transition-colors"
                              >
                                Publish
                              </button>
                            )}
                            {version.publicationStatus === 'SUPERSEDED' && (
                              <button 
                                onClick={() => {
                                  if (confirm('Restore this version? It will become the new ACTIVE version.')) {
                                    restoreMutation.mutate(version.id);
                                  }
                                }}
                                disabled={restoreMutation.isPending}
                                className="px-3 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 transition-colors"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Manual Edits Log */}
                      {version.edits && version.edits.length > 0 && (
                        <div className="bg-[#0B0A11] rounded-xl border border-white/5 p-4 space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Manual Edits on v{version.version}</h4>
                          <div className="space-y-2">
                            {version.edits.map((edit: any) => (
                              <div key={edit.id} className="grid grid-cols-3 gap-4 text-xs">
                                <div className="text-gray-300 font-medium">{edit.field}</div>
                                <div className="text-rose-300/80 line-through truncate" title={edit.previousValue}>{edit.previousValue || 'null'}</div>
                                <div className="text-emerald-400 truncate" title={edit.newValue}>{edit.newValue || 'null'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Structural Diff vs Previous */}
                      {previousVersion && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-rose-400 mb-2">Previous (v{previousVersion.version})</h4>
                            <pre className="text-[10px] text-gray-400 whitespace-pre-wrap overflow-auto max-h-60">
                              {JSON.stringify({
                                positioning: previousVersion.positioning,
                                tone: previousVersion.tone,
                                audience: previousVersion.audience,
                                avoidList: previousVersion.avoidList,
                              }, null, 2)}
                            </pre>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-emerald-400 mb-2">Generated (v{version.version})</h4>
                            <pre className="text-[10px] text-gray-300 whitespace-pre-wrap overflow-auto max-h-60">
                              {JSON.stringify({
                                positioning: version.positioning,
                                tone: version.tone,
                                audience: version.audience,
                                avoidList: version.avoidList,
                              }, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
