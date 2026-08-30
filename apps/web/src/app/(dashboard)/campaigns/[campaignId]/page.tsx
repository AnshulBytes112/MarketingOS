import { requireAuth } from "@abge/auth";
import { prisma } from "@abge/database";
import { notFound } from "next/navigation";
import { CampaignDetailClient } from "./campaign-detail-client";

export default async function CampaignDetailPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const session = await requireAuth();

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.campaignId,
      organizationId: session.organizationId,
    },
    include: {
      brand: true,
      channels: {
        include: { contentChannel: true },
      },
      kpis: true,
      strategy: true,
      contentItems: {
        include: {
          generations: true,
          approvals: true,
          publishingJobs: true,
        }
      }
    },
  });

  if (!campaign) {
    notFound();
  }

  // Calculate deterministic progress counts
  let planned = 0;
  let generated = 0;
  let approved = 0;
  let scheduled = 0;
  let published = 0;

  for (const item of campaign.contentItems) {
    planned++;
    
    // Check generations
    const hasCompletedGen = item.generations.some(g => 
      g.textStatus === "COMPLETED" || g.imageStatus === "COMPLETED" || g.videoStatus === "COMPLETED"
    );
    if (hasCompletedGen) generated++;

    // Check approvals
    const isApproved = item.approvals.some(a => a.status === "APPROVED");
    if (isApproved) approved++;

    // Check scheduled/published
    const activeScheduled = item.publishingJobs.some(p => p.status === "SCHEDULED" || p.status === "QUEUED");
    if (activeScheduled) scheduled++;

    const isPublished = item.publishingJobs.some(p => p.status === "PUBLISHED");
    if (isPublished) published++;
  }

  const progress = {
    planned,
    generated,
    approved,
    scheduled,
    published,
  };

  return (
    <div className="space-y-6">
      <CampaignDetailClient campaign={campaign} progress={progress} />
    </div>
  );
}
