import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import { notFound } from 'next/navigation';
import CompetitorDetailClient from './competitor-detail-client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompetitorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireAuth();

  const brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    return notFound();
  }

  return (
    <CompetitorDetailClient 
      competitorId={id} 
      brandId={brand.id} 
      userRole={session.role}
    />
  );
}
