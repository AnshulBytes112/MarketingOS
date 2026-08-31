'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, AlertTriangle, ArrowRight, Eye, Calendar, Sparkles } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'all' | 'needs_opt' | 'top_perf'>('all');

  const allReports = initialOverview.allAnalyses || [];

  if (allReports.length === 0) {
    return (
      <div className="bg-[#12111A] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No SEO Analyses Found</h2>
        <p className="text-gray-400 max-w-md">
          There are no SEO analyses run for this period. Go to the Content Calendar, open a post details card, and click "SEO Analysis" to analyze your content!
        </p>
      </div>
    );
  }

  // Filter reports based on tab
  const filteredReports = allReports.filter((item: any) => {
    if (activeTab === 'needs_opt') {
      return item.status === 'COMPLETED' && (item.score || 0) < 70;
    }
    if (activeTab === 'top_perf') {
      return item.status === 'COMPLETED' && (item.score || 0) >= 80;
    }
    return true;
  });

  // Calculate search intent distribution
  const intentCounts: Record<string, number> = {};
  allReports.forEach((item: any) => {
    if (item.status === 'COMPLETED' && item.searchIntent) {
      intentCounts[item.searchIntent] = (intentCounts[item.searchIntent] || 0) + 1;
    }
  });

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-4 bottom-4 text-white/5 font-bold text-6xl select-none">
            #
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Analyzed</h3>
          <div className="text-4xl font-extrabold text-white">{allReports.length}</div>
          <p className="text-xs text-gray-500 mt-2">
            Completed: {initialOverview.totalCompleted || 0} | Pending: {allReports.filter((r: any) => r.status === 'ANALYZING').length}
          </p>
        </div>

        <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Average SEO Score</h3>
          <div className={`text-4xl font-extrabold ${initialOverview.averageScore >= 80 ? 'text-emerald-400' : initialOverview.averageScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {initialOverview.averageScore}
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on completed evaluations</p>
        </div>

        <div className="bg-[#12111A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Intent</h3>
          <div className="text-2xl font-bold text-white truncate">
            {Object.keys(intentCounts).length > 0
              ? Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0][0]
              : 'N/A'}
          </div>
          <p className="text-xs text-gray-500 mt-2">Dominant user search intent theme</p>
        </div>
      </div>

      {/* Tabs / Filters and Table */}
      <div className="bg-[#12111A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">SEO Analysis Reports</h3>
            <p className="text-xs text-gray-400 mt-0.5">List of all keyword and semantic intent analyses run on your content.</p>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-white/5 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'all' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              All Reports ({allReports.length})
            </button>
            <button
              onClick={() => setActiveTab('needs_opt')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'needs_opt' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Needs Opt ({initialOverview.needsOptimization.length})
            </button>
            <button
              onClick={() => setActiveTab('top_perf')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'top_perf' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Top Optimized ({initialOverview.topPerforming.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500 italic">No reports found for this filter.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Content Piece</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Search Intent</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-400 tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReports.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {item.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 text-[10px] uppercase font-bold rounded">
                        {item.platform}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300 truncate max-w-[200px]" title={item.searchIntent || 'N/A'}>
                        {item.searchIntent || '—'}
                      </div>
                    </td>
                    <td className="p-4">
                      {item.status === 'COMPLETED' ? (
                        <div className={`text-base font-extrabold ${item.score >= 80 ? 'text-emerald-400' : item.score >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {item.score}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase">
                          Completed
                        </span>
                      )}
                      {item.status === 'ANALYZING' && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded uppercase animate-pulse">
                          Analyzing
                        </span>
                      )}
                      {item.status === 'FAILED' && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded uppercase">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/seo/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
