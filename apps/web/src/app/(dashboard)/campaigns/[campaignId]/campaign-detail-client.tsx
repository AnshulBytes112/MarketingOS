"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@abge/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@abge/ui/components/ui/card";
import { Badge } from "@abge/ui/components/ui/badge";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
              {campaign.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.brand.name}</p>
        </div>

        <div className="flex gap-2">
          {campaign.status === "DRAFT" || campaign.status === "PLANNING" || campaign.status === "PAUSED" ? (
            <Button onClick={() => handleStatusChange("ACTIVE")}>
              <Play className="mr-2 h-4 w-4" /> Activate Campaign
            </Button>
          ) : campaign.status === "ACTIVE" ? (
            <>
              <Button variant="outline" onClick={() => handleStatusChange("PAUSED")}>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
              <Button onClick={() => handleStatusChange("COMPLETED")}>
                <CheckCircle className="mr-2 h-4 w-4" /> Complete
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Objective</h4>
                <p>{campaign.objective || "Not specified"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Duration</h4>
                <p>
                  {campaign.startDate ? format(new Date(campaign.startDate), "MMM d, yyyy") : "TBD"} -{" "}
                  {campaign.endDate ? format(new Date(campaign.endDate), "MMM d, yyyy") : "TBD"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Strategy Version</h4>
                <p>{campaign.strategyId ? `Version ${campaign.strategyVersion || "Unknown"}` : "None"}</p>
              </div>
              {campaign.audience && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Audience Focus</h4>
                  <pre className="text-sm bg-muted p-2 rounded-md">{JSON.stringify(campaign.audience, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Campaign Planning</CardTitle>
              <CardDescription>Use AI to propose content themes, quantities, and KPIs.</CardDescription>
            </CardHeader>
            <CardContent>
              {!campaign.aiProposal ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                  <Wand2 className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    No active AI proposal. Generating a plan will consume AI tokens.
                  </p>
                  <Button onClick={handleGeneratePlan} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Campaign Plan"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <p className="font-medium">Proposal Summary:</p>
                    <p>{(campaign.aiProposal as any).summary}</p>
                    <p className="mt-2 font-medium">Channel Allocation:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {((campaign.aiProposal as any).channelPlan || []).map((cp: any, idx: number) => (
                        <li key={idx}>{cp.suggestedContentCount} items for {cp.platform || 'Platform'} ({cp.purpose})</li>
                      ))}
                    </ul>
                  </div>
                  <Button onClick={handleApplyPlan} disabled={isApplying} className="w-full">
                    <Check className="mr-2 h-4 w-4" /> Apply Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Planned</span>
                  <span className="font-medium">{progress.planned}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Generated</span>
                  <span className="font-medium">{progress.generated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="font-medium">{progress.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="font-medium">{progress.scheduled}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="font-medium">{progress.published}</span>
                </div>
                
                <Link href={`/calendar?campaignId=${campaign.id}`}>
                  <Button variant="outline" className="w-full mt-4">View in Calendar</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KPIs</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.kpis.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No KPIs defined.</p>
              ) : (
                <div className="space-y-4">
                  {campaign.kpis.map((kpi: any) => (
                    <div key={kpi.id} className="text-sm">
                      <p className="font-medium">{kpi.metric}</p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Target: {kpi.targetValue} {kpi.unit}</span>
                        <span>Base: {kpi.baselineValue ?? "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Performance data will appear after analytics is connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
