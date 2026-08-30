import { requireAuth } from "@abge/auth";
import { prisma } from "@abge/database";
import { CampaignsClient } from "./campaigns-client";

export default async function CampaignsPage() {
  const session = await requireAuth();

  const campaigns = await prisma.campaign.findMany({
    where: { organizationId: session.organizationId },
    include: {
      brand: true,
      channels: {
        include: { contentChannel: true },
      },
      kpis: true,
      _count: {
        select: { contentItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaign Engine</h1>
        <p className="text-muted-foreground">Manage your coordinated marketing initiatives.</p>
      </div>
      <CampaignsClient campaigns={campaigns} />
    </div>
  );
}
