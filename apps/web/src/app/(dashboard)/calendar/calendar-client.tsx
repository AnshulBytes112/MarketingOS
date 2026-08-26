'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

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

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  format: string;
  scheduledDate: Date;
  funnelStage: string;
  contentPillar: string;
  theme: string | null;
  status: string;
}

interface CalendarClientProps {
  initialItems: ContentItem[];
  brandName: string;
}

export default function CalendarClient({ initialItems, brandName }: CalendarClientProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // Group or filter items
  const filteredItems = initialItems.filter((item) => {
    const matchesPlatform =
      platformFilter === 'ALL' || item.platform.toUpperCase() === platformFilter.toUpperCase();
    const matchesFunnel =
      funnelFilter === 'ALL' || item.funnelStage.toUpperCase() === funnelFilter.toUpperCase();
    return matchesPlatform && matchesFunnel;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <PlatformIcon platform="instagram" className="w-4 h-4 text-pink-400" />;
      case 'linkedin':
        return <PlatformIcon platform="linkedin" className="w-4 h-4 text-blue-400" />;
      case 'twitter':
      case 'x':
        return <PlatformIcon platform="twitter" className="w-4 h-4 text-sky-400" />;
      case 'youtube':
        return <PlatformIcon platform="youtube" className="w-4 h-4 text-red-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const getFunnelBadgeClass = (stage: string) => {
    switch (stage.toUpperCase()) {
      case 'TOFU':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'MOFU':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'BOFU':
        return 'bg-pink-500/10 border-pink-500/30 text-pink-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getFunnelLabel = (stage: string) => {
    switch (stage.toUpperCase()) {
      case 'TOFU':
        return 'Reach New People';
      case 'MOFU':
        return 'Build Interest & Trust';
      case 'BOFU':
        return 'Drive Action';
      default:
        return stage;
    }
  };

  // Format date helper
  const formatDate = (dateInput: any) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" />
            Content Calendar
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Publishing pipeline for <span className="text-purple-400 font-semibold">{brandName}</span>. 14-day campaign execution map.
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 bg-[#0B0A11]/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              view === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              view === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Filter className="w-4 h-4 text-purple-500" />
          <span>Filter:</span>
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
        >
          <option value="ALL">All Platforms</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="TWITTER">Twitter/X</option>
          <option value="YOUTUBE">YouTube</option>
        </select>

        <select
          value={funnelFilter}
          onChange={(e) => setFunnelFilter(e.target.value)}
          className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
        >
          <option value="ALL">All Funnel Stages</option>
          <option value="TOFU">Reach New People</option>
          <option value="MOFU">Build Interest & Trust</option>
          <option value="BOFU">Drive Action</option>
        </select>
      </div>

      {/* Grid Calendar / List Items */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
          <CalendarIcon className="w-10 h-10 text-purple-500 mb-4 opacity-50" />
          <h3 className="text-white font-medium mb-1">No Scheduled Posts Found</h3>
          <p className="text-gray-400 text-sm max-w-md text-center">
            Try adjusting your filters or verify that a strategy has been approved to generate a calendar.
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-[#12111A]/90 border border-white/5 hover:border-purple-500/40 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:translate-y-[-2px] duration-300 relative group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(item.scheduledDate)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>

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

                <div className="text-[10px] text-gray-400 line-clamp-1">
                  <span className="font-semibold text-purple-400">Pillar: </span>
                  {item.contentPillar}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0B0A11]/30 text-xs text-gray-400 font-semibold">
                  <th className="py-4 px-6">Scheduled Date</th>
                  <th className="py-4 px-6">Post Concept</th>
                  <th className="py-4 px-6">Platform</th>
                  <th className="py-4 px-6">Format</th>
                  <th className="py-4 px-6">Funnel Stage</th>
                  <th className="py-4 px-6">Content Pillar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-white/5 transition-colors cursor-pointer text-white"
                  >
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                      {formatDate(item.scheduledDate)}
                    </td>
                    <td className="py-4 px-6 font-semibold line-clamp-2 max-w-xs">
                      {item.title}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {getPlatformIcon(item.platform)}
                        <span className="capitalize">{item.platform}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 capitalize">{item.format}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${getFunnelBadgeClass(item.funnelStage)}`}>
                        {getFunnelLabel(item.funnelStage)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 max-w-xs truncate">
                      {item.contentPillar}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12111A] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(selectedItem.scheduledDate)}
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white text-lg font-semibold bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#0B0A11]/60 p-4 rounded-xl border border-white/5 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400">Platform</span>
                <div className="flex items-center gap-1.5 text-white font-medium capitalize">
                  {getPlatformIcon(selectedItem.platform)}
                  {selectedItem.platform}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400">Content Format</span>
                <div className="text-white font-medium capitalize">{selectedItem.format}</div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400">Funnel Stage</span>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${getFunnelBadgeClass(selectedItem.funnelStage)}`}>
                    {getFunnelLabel(selectedItem.funnelStage)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400">Status</span>
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                    {selectedItem.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 font-medium">Content Pillar</span>
                <p className="bg-white/5 border border-white/5 rounded-lg p-3 text-white">
                  {selectedItem.contentPillar}
                </p>
              </div>

              {selectedItem.theme && (
                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Strategic Theme</span>
                  <p className="bg-white/5 border border-white/5 rounded-lg p-3 text-white">
                    {selectedItem.theme}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
