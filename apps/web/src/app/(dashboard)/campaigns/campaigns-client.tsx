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

  const CreateCampaignDialog = () => (
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
        <CreateCampaignDialog />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="block group">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.brand.name}</CardDescription>
                    </div>
                    <Badge variant={
                      campaign.status === "ACTIVE" ? "default" :
                      campaign.status === "DRAFT" ? "secondary" :
                      "outline"
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Objective: </span>
                      <span className="font-medium line-clamp-1">{campaign.objective || "None"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-medium">
                        {campaign.startDate ? format(new Date(campaign.startDate), "MMM d, yyyy") : "TBD"} -{" "}
                        {campaign.endDate ? format(new Date(campaign.endDate), "MMM d, yyyy") : "TBD"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Content: </span>
                      <span className="font-medium">{campaign._count?.contentItems || 0} planned items</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <CreateCampaignDialog />
    </>
  );
}
