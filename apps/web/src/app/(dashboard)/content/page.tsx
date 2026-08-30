import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import ContentClient from './content-client';

export default async function Page() {
  const session = await requireAuth();

  // Find the active brand
  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#12111A]/90 border border-white/5 rounded-2xl">
        <h3 className="text-white font-medium mb-1">No Brand Found</h3>
        <p className="text-gray-400 text-sm">Please create a brand first.</p>
      </div>
    );
  }

  // Fetch all campaigns for the active brand
  const campaigns = await prisma.campaign.findMany({
    where: { organizationId: session.organizationId, brandId: brand.id },
    select: { id: true, name: true },
  });

  // Fetch all Content Items for the brand (ordered by date desc)
  const items = await prisma.contentItem.findMany({
    where: {
      brandId: brand.id,
      organizationId: session.organizationId,
    },
    orderBy: { scheduledDate: 'desc' },
    include: {
      generations: {
        orderBy: { version: 'desc' },
        take: 5,
        include: {
          approvals: true
        }
      },
      channel: true
    }
  });

  const permissions = {
    canView: session.effectivePermissions.includes('content.view'),
    canEdit: session.effectivePermissions.includes('content.edit'),
    canGenerate: session.effectivePermissions.includes('content.generate'),
    canAnalyzeSEO: session.effectivePermissions.includes('seo.analyze'),
    canOptimizeSEO: session.effectivePermissions.includes('seo.optimize'),
  };

  // Serialize Date objects to ISO strings for Client Component boundary
  const serializedItems = items.map(item => ({
    ...item,
    scheduledDate: item.scheduledDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    generations: item.generations.map(gen => ({
      ...gen,
      createdAt: gen.createdAt.toISOString(),
      updatedAt: gen.updatedAt.toISOString(),
      approvals: gen.approvals.map(app => ({
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      }))
    }))
  }));

  return (
    <ContentClient
      initialItems={serializedItems as any}
      brandName={brand.name}
      brandId={brand.id}
      organizationId={session.organizationId}
      permissions={permissions}
      campaigns={campaigns}
    />
  );
}

