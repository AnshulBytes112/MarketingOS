"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@abge/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@abge/ui/components/ui/card";
import { Badge } from "@abge/ui/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@abge/ui/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@abge/ui/components/ui/dialog";
import { Input } from "@abge/ui/components/ui/input";
import { Label } from "@abge/ui/components/ui/label";
import { createCampaign } from "./actions";

export function CampaignsClient({ campaigns, brands = [] }: { campaigns: any[]; brands?: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    brandId: brands[0]?.id || "",
    objective: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brandId) return;

    try {
      setIsSubmitting(true);
      await createCampaign({
        name: formData.name,
        brandId: formData.brandId,
        objective: formData.objective || undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        brandId: brands[0]?.id || "",
        objective: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogNode = (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#0B0A11] border border-white/10 shadow-2xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Define a new marketing initiative to coordinate your content and strategy.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <select
              id="brand"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              required
            >
              {brands.map(b => (
                <option key={b.id} value={b.id} className="bg-[#12111A] text-white">{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Summer Launch 2027" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Input 
              id="objective" 
              placeholder="e.g. Drive awareness for new product" 
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input 
                id="endDate" 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.brandId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (campaigns.length === 0) {
    return (
      <>
        <EmptyState
          title="No Campaigns"
          description="Create your first campaign to start orchestrating your marketing efforts."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          }
        />
        {dialogNode}
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white border-0 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all font-medium px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group h-full">
              <div className="h-full bg-white/50 dark:bg-[#0B0A11]/60 backdrop-blur-xl border border-gray-200 dark:border-white/5 hover:border-purple-500/50 dark:hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 relative overflow-hidden flex flex-col group/card">
                
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex justify-between items-start gap-4 mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover/card:text-purple-600 dark:group-hover/card:text-purple-300 transition-colors truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400/90 mt-1.5 font-bold tracking-widest uppercase truncate">
                      {campaign.brand.name}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                    campaign.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    campaign.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="relative z-10 mt-auto space-y-5 pt-5 border-t border-gray-200 dark:border-white/5">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">Objective</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                      {campaign.objective || <span className="text-gray-400 dark:text-gray-600 italic font-light">No objective defined</span>}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
                    <div className="space-y-2 min-w-[120px]">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">Duration</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-white/5 inline-block">
                        {campaign.startDate ? format(new Date(campaign.startDate), "MMM d") : "TBD"} -{" "}
                        {campaign.endDate ? format(new Date(campaign.endDate), "MMM d, yyyy") : "TBD"}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">Content</p>
                      <p className="text-xs font-bold text-purple-700 dark:text-white bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1.5 rounded-md inline-block">
                        {campaign._count?.contentItems || 0} items
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {dialogNode}
    </>
  );
}
