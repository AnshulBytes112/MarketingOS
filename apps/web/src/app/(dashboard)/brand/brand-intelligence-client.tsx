'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Upload,
  Globe,
  Building2,
  MapPin,
  Tag,
  Calendar,
  Layers,
  ShieldAlert,
  Users,
  CheckCircle2,
  MessageSquare,
  FileText,
  Volume2,
  Target,
  BarChart,
} from 'lucide-react';

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

export default function BrandIntelligenceClient({ brand }: { brand: BrandData }) {
  const [activeTab, setActiveTab] = useState<'dna' | 'voice' | 'audience' | 'assets' | 'guidelines'>('dna');

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
          <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-400" />
            <span>Upload Asset</span>
          </button>

          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-medium text-white transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30">
            <Sparkles className="w-4 h-4" />
            <span>Regenerate DNA</span>
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
                <div className="flex justify-between py-2 text-xs">
                  <span className="text-gray-400">Founded</span>
                  <span className="font-medium text-white">2021</span>
                </div>
              </div>
            </div>

            {/* Hero Product Asset */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold text-white">Hero Product Asset</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  Active Pack
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0B0A11]">
                <Image
                  src="/images/product_package.png"
                  alt="Packaging Mockup"
                  width={600}
                  height={300}
                  className="w-full h-44 object-cover"
                />
              </div>
              <p className="text-xs text-gray-400">
                NovaBrew Ethiopian Yirgacheffe Single-Origin Packaging Mockup
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Positioning & USP */}
            <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Positioning & USP</h3>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Positioning Statement
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                    {brand.positioning}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Unique Value Proposition
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                    {brand.usp}
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
                {contentPillars.map((pillar) => (
                  <div key={pillar.name} className="space-y-1">
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
                {avoidList.map((item) => (
                  <div
                    key={item}
                    className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              <h3 className="text-base font-semibold text-white">Tone Attributes</h3>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {toneAttributes.map((attr) => (
                  <span
                    key={attr}
                    className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Brand Voice */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Sample Brand Voice</h3>

            <div className="space-y-4 pt-1">
              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Caption Style
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed italic">
                  "Every cup begins with a choice. NovaBrew Yirgacheffe — single-origin, carefully sourced, thoughtfully roasted."
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  LinkedIn Post
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200 leading-relaxed">
                  "Specialty coffee isn't a luxury. It's a direct payment to the farmers who invested years perfecting their craft."
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  CTA Style
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-purple-300 font-medium">
                  Explore the origin →
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
                  Primary Audience
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200">
                  {brand.targetAudience}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Secondary Audience
                </h4>
                <div className="p-3.5 rounded-xl bg-[#181624]/70 border border-white/5 text-xs text-gray-200">
                  Coffee enthusiasts & sustainability advocates
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Psychographics
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Health-conscious', 'Experience-driven', 'Eco-aware', 'Tech-savvy'].map((psy) => (
                    <span
                      key={psy}
                      className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium"
                    >
                      {psy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Audience Demographics</h3>

            <div className="space-y-4 pt-2">
              {audienceDemographics.map((demo) => (
                <div key={demo.range} className="space-y-1.5">
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
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSETS */}
      {activeTab === 'assets' && (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">Brand Assets Studio</h3>
            <button className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> Upload Asset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0B0A11] p-3 space-y-2">
              <Image
                src="/images/product_package.png"
                alt="Product Packaging"
                width={400}
                height={250}
                className="w-full h-36 object-cover rounded-lg"
              />
              <div className="text-xs font-medium text-white">Single-Origin Packaging</div>
              <div className="text-[10px] text-gray-500">Packaging Mockup · 2026</div>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0B0A11] p-3 space-y-2">
              <Image
                src="/images/cold_brew.png"
                alt="Cold Brew Campaign"
                width={400}
                height={250}
                className="w-full h-36 object-cover rounded-lg"
              />
              <div className="text-xs font-medium text-white">Cold Brew Campaign Creative</div>
              <div className="text-[10px] text-gray-500">Social Creative · 2026</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6 space-y-6 animate-in fade-in">
          <h3 className="text-base font-semibold text-white">Brand Guidelines</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#181624]/70 border border-white/5 space-y-2">
              <h4 className="text-xs font-semibold text-purple-400">Color Palette</h4>
              <div className="flex gap-2 pt-2">
                <div className="w-8 h-8 rounded-lg bg-[#9333ea] flex items-center justify-center text-[9px] font-mono text-white">#9333</div>
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-[9px] font-mono text-white">#3b82</div>
                <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center text-[9px] font-mono text-white">#10b9</div>
                <div className="w-8 h-8 rounded-lg bg-[#0b0a11] border border-white/20 flex items-center justify-center text-[9px] font-mono text-white">#0b0a</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#181624]/70 border border-white/5 space-y-2">
              <h4 className="text-xs font-semibold text-purple-400">Typography</h4>
              <p className="text-xs text-gray-300">Primary Font: Inter / Space Grotesk</p>
              <p className="text-xs text-gray-400">Heading Weights: 700 / 800 Bold</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
