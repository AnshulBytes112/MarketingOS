"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@abge/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@abge/ui/components/ui/card";
import { ArrowLeft, Play, Pause, CheckCircle, Wand2, Check } from "lucide-react";
import Link from "next/link";
import { generateCampaignPlan, applyCampaignPlan, updateCampaignStatus } from "../actions";
import { toast } from "sonner";

export function CampaignDetailClient({ campaign, progress }: { campaign: any, progress: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleGeneratePlan = async () => {
    try {
      setIsGenerating(true);
      await generateCampaignPlan(campaign.id);
      toast.success("Campaign planning started! Check back in a few moments.");
    } catch (e: any) {
      toast.error(e.message || "Failed to start AI planning.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPlan = async () => {
    try {
      setIsApplying(true);
      const res = await applyCampaignPlan(campaign.id);
      toast.success(`Plan applied successfully! Created ${res.createdCount} content items.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to apply plan.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleStatusChange = async (status: any) => {
    try {
      await updateCampaignStatus(campaign.id, status);
      toast.success(`Campaign marked as ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/campaigns" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase ${
              campaign.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
              campaign.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' :
              'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/20'
            }`}>
              {campaign.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-1">{campaign.name}</h1>
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400/90 uppercase tracking-widest">{campaign.brand.name}</p>
        </div>

        <div className="flex gap-2 shrink-0 md:mb-1">
          {campaign.status === "DRAFT" || campaign.status === "PLANNING" || campaign.status === "PAUSED" ? (
            <Button onClick={() => handleStatusChange("ACTIVE")} className="bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all border-0 font-medium text-xs h-9 px-4">
              <Play className="mr-1.5 h-3.5 w-3.5" /> Activate Campaign
            </Button>
          ) : campaign.status === "ACTIVE" ? (
            <>
              <Button variant="outline" onClick={() => handleStatusChange("PAUSED")} className="dark:border-white/10 dark:hover:bg-white/5 text-xs h-9 px-4">
                <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause
              </Button>
              <Button onClick={() => handleStatusChange("COMPLETED")} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border-0 font-medium text-xs h-9 px-4">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Complete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-5">
        {/* OVERVIEW SECTION */}
        <Card size="sm" className="bg-white dark:bg-[#0B0A11]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-xl rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-100 pointer-events-none" />
          <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-2 relative z-10 bg-gray-50/50 dark:bg-white/5 px-4 py-3">
            <CardTitle className="text-gray-900 dark:text-white text-sm font-semibold">Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
              <div className="col-span-2">
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Objective</h4>
                <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed font-medium">{campaign.objective || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Duration</h4>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {campaign.startDate ? format(new Date(campaign.startDate), "MMM d") : "TBD"} &mdash;{" "}
                  {campaign.endDate ? format(new Date(campaign.endDate), "MMM d, yyyy") : "TBD"}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Strategy</h4>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {campaign.strategyId ? `v${campaign.strategyVersion || "1.0"}` : "None"}
                </p>
              </div>
            </div>
            {campaign.audience && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Audience Focus</h4>
                <pre className="text-xs bg-gray-100 dark:bg-black/50 text-gray-800 dark:text-gray-300 p-3 rounded-lg border border-gray-200 dark:border-white/10 overflow-auto">{JSON.stringify(campaign.audience, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI CAMPAIGN PLANNING SECTION */}
        <Card size="sm" className="bg-white dark:bg-[#0B0A11]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-xl rounded-2xl relative overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-2 relative z-10 bg-gray-50/50 dark:bg-white/5 flex flex-row justify-between items-center space-y-0 px-4 py-3">
            <div>
              <CardTitle className="text-gray-900 dark:text-white text-sm font-semibold">AI Campaign Planning</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Use AI to propose content themes, quantities, and KPIs.</CardDescription>
            </div>
            {campaign.aiProposal && (
              <Button onClick={handleApplyPlan} disabled={isApplying} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg border-0 shrink-0 h-8 text-xs px-3">
                <Check className="mr-1 h-3.5 w-3.5" /> Apply AI Plan
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {!campaign.aiProposal ? (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-5 bg-gray-50/50 dark:bg-white/[0.02] gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">No active AI proposal</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Generating a plan will consume AI tokens.</p>
                  </div>
                </div>
                <Button onClick={handleGeneratePlan} disabled={isGenerating} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-lg shrink-0 text-xs h-8 px-3">
                  {isGenerating ? "Generating..." : "Generate Campaign Plan"}
                </Button>
              </div>
            ) : (
              <div className="p-4 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Proposal Summary</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{(campaign.aiProposal as any).summary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Channel Allocation</p>
                  <ul className="space-y-1">
                    {((campaign.aiProposal as any).channelPlan || []).map((cp: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs">
                        <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{cp.suggestedContentCount} items</span> 
                        <span className="text-gray-500 dark:text-gray-400">for {cp.platform || 'Platform'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PROGRESS & KPIs */}
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <Card size="sm" className="bg-white dark:bg-[#0B0A11]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-xl rounded-2xl relative flex flex-col">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-2 bg-gray-50/50 dark:bg-white/5 px-4 py-3">
              <CardTitle className="text-gray-900 dark:text-white text-sm font-semibold">Operational Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {[
                  { label: 'Planned', value: progress.planned, color: 'text-gray-500' },
                  { label: 'Generated', value: progress.generated, color: 'text-blue-500' },
                  { label: 'Approved', value: progress.approved, color: 'text-emerald-500' },
                  { label: 'Scheduled', value: progress.scheduled, color: 'text-purple-500' },
                  { label: 'Published', value: progress.published, color: 'text-pink-500' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 dark:border-white/[0.02] last:border-0">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                    <span className={`font-bold text-sm ${stat.value > 0 ? stat.color : 'text-gray-400 dark:text-gray-600'}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <Link href={`/calendar?campaignId=${campaign.id}`} className="block mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                <Button variant="outline" size="sm" className="w-full bg-white dark:bg-transparent dark:border-white/10 dark:hover:bg-white/5 shadow-sm text-xs h-8">
                  View in Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card size="sm" className="bg-white dark:bg-[#0B0A11]/60 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-xl rounded-2xl relative flex flex-col">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-2 bg-gray-50/50 dark:bg-white/5 px-4 py-3">
              <CardTitle className="text-gray-900 dark:text-white text-sm font-semibold">KPIs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4 flex-1">
              {campaign.kpis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center min-h-[140px]">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">No KPIs defined yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaign.kpis.map((kpi: any) => (
                    <div key={kpi.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{kpi.metric}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Base: {kpi.baselineValue ?? "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded text-[10px] border border-purple-200 dark:border-purple-500/20">
                          {kpi.targetValue} {kpi.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
