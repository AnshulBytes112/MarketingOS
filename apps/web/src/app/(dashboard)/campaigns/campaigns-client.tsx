"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@abge/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@abge/ui/components/ui/card";
import { Badge } from "@abge/ui/components/ui/badge";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@abge/ui/components/ui/empty-state";

export function CampaignsClient({ campaigns }: { campaigns: any[] }) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No Campaigns"
        description="Create your first campaign to start orchestrating your marketing efforts."
        action={{
          label: "Create Campaign",
          onClick: () => {
            // Usually this would open a modal or redirect
            alert("Create Campaign Modal - to be implemented");
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => alert("Create Campaign Modal - to be implemented")}>
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
                    <span className="font-medium">{campaign._count.contentItems} planned items</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
