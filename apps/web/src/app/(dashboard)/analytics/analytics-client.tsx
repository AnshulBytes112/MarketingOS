'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { syncAnalytics } from './actions';
import { Loader2, RefreshCw, Download, BarChart2, TrendingUp, Users, Eye, MousePointer2 } from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsClientProps {
  organizationId: string;
  initialOverview: any;
  initialContentPerformance: any[];
  channels: any[];
  canSync: boolean;
  canExport: boolean;
  initialDateRange: { from: string; to: string };
}

export default function AnalyticsClient({
  organizationId,
  initialOverview,
  initialContentPerformance,
  channels,
  canSync,
  canExport,
  initialDateRange,
}: AnalyticsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncChannelId, setSyncChannelId] = useState<string>('');

  const handleSync = async () => {
    if (!canSync) return;
    setIsSyncing(true);
    try {
      await syncAnalytics(syncChannelId || undefined);
      alert('Sync job enqueued. Data will update shortly.');
      router.refresh();
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDateChange = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);
    
    params.set('from', from.toISOString());
    params.set('to', now.toISOString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#12111A]/90 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <select 
            className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            onChange={(e) => handleDateChange(parseInt(e.target.value))}
            defaultValue="30"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          {canSync && (
            <div className="flex items-center gap-2">
              <select 
                value={syncChannelId}
                onChange={(e) => setSyncChannelId(e.target.value)}
                className="bg-[#0B0A11]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-gray-400"
              >
                <option value="">All Channels</option>
                {channels.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium transition-colors"
              >
                {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Sync
              </button>
            </div>
          )}

          {canExport && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Published Content" value={initialOverview.totalPublished} icon={<BarChart2 className="w-4 h-4" />} />
        <StatCard title="People Reached" value={initialOverview.totalReach} icon={<Users className="w-4 h-4" />} />
        <StatCard title="Engagement" value={initialOverview.totalEngagement} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard title="Engagement Rate" value={initialOverview.averageEngagementRate !== null ? `${initialOverview.averageEngagementRate.toFixed(2)}%` : null} icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard title="Website Clicks" value={initialOverview.totalClicks} icon={<MousePointer2 className="w-4 h-4" />} />
        <StatCard title="Video Views" value={initialOverview.totalViews} icon={<Eye className="w-4 h-4" />} />
      </div>

      <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Content Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0B0A11]/30 text-xs text-gray-400 font-semibold">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Content</th>
                <th className="py-4 px-6">Channel</th>
                <th className="py-4 px-6 text-right">Reach</th>
                <th className="py-4 px-6 text-right">Engagement</th>
                <th className="py-4 px-6 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {initialContentPerformance.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No data available for the selected period.
                  </td>
                </tr>
              )}
              {initialContentPerformance.map((item, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors text-white">
                  <td className="py-4 px-6 whitespace-nowrap text-gray-400">
                    {format(new Date(item.metricDate), 'MMM d, yyyy')}
                  </td>
                  <td className="py-4 px-6 font-medium line-clamp-1 max-w-[200px]" title={item.contentTitle}>
                    {item.contentTitle}
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {item.platform}
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    {item.reach !== null ? item.reach.toLocaleString() : <span className="text-gray-600 text-[10px]">N/A</span>}
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    {item.engagement !== null ? item.engagement.toLocaleString() : <span className="text-gray-600 text-[10px]">N/A</span>}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-emerald-400">
                    {item.engagementRate !== null ? `${item.engagementRate.toFixed(2)}%` : <span className="text-gray-600 text-[10px]">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number | null; icon: React.ReactNode }) {
  return (
    <div className="bg-[#12111A]/90 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
      <div className="flex items-center gap-3 text-sm font-medium text-gray-400 mb-3">
        <div className="p-2 rounded-lg bg-white/5 text-purple-400 group-hover:bg-purple-500/10 group-hover:scale-110 transition-all">
          {icon}
        </div>
        {title}
      </div>
      <div className="text-3xl font-bold tracking-tight text-white flex items-baseline gap-2">
        {value === null || value === undefined ? (
          <span className="text-sm text-gray-500 font-normal">Data not available</span>
        ) : (
          value.toLocaleString()
        )}
      </div>
    </div>
  );
}
