'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { BarChart3, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SeoClientProps {
  organizationId: string;
  initialOverview: any;
  canAnalyze: boolean;
  canOptimize: boolean;
  canExport: boolean;
  initialDateRange: { from: string; to: string };
}

export default function SeoClient({
  organizationId,
  initialOverview,
  canAnalyze,
  canOptimize,
  canExport,
  initialDateRange
}: SeoClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If there's no data, we show a clean empty state.
  if (initialOverview.totalAnalyzed === 0) {
    return (
      <div className="bg-[#12111A] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Not enough data</h2>
        <p className="text-gray-400 max-w-md">
          There are no completed SEO analyses for this time period. You can run SEO Analysis from the Content Studio on any generated content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Analyzed Items</h3>
          <div className="text-4xl font-bold text-white">{initialOverview.totalAnalyzed}</div>
        </div>

        <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Average SEO Score</h3>
          <div className={`text-4xl font-bold ${initialOverview.averageScore >= 80 ? 'text-emerald-400' : initialOverview.averageScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {initialOverview.averageScore}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Needs Optimization */}
        <div className="bg-[#12111A] border border-white/5 rounded-2xl flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Needs Optimization
            </h3>
            <p className="text-xs text-gray-400 mt-1">Content scoring below 70.</p>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {initialOverview.needsOptimization.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No content currently needs optimization.</p>
            ) : (
              <div className="space-y-4">
                {initialOverview.needsOptimization.map((item: any) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-[10px] uppercase font-bold rounded">{item.platform}</span>
                        <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Intent: {item.searchIntent}</p>
                    </div>
                    <div className="text-xl font-bold text-red-400 shrink-0 ml-4">
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Performing SEO */}
        <div className="bg-[#12111A] border border-white/5 rounded-2xl flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Top Optimized
            </h3>
            <p className="text-xs text-gray-400 mt-1">Content scoring 80 and above.</p>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {initialOverview.topPerforming.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No highly optimized content yet.</p>
            ) : (
              <div className="space-y-4">
                {initialOverview.topPerforming.map((item: any) => (
                  <div key={item.id} className="bg-white/5 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold rounded">{item.platform}</span>
                        <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Intent: {item.searchIntent}</p>
                    </div>
                    <div className="text-xl font-bold text-emerald-400 shrink-0 ml-4">
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
