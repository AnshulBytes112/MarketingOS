import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import CompetitorsClient from './competitors-client';

export const dynamic = 'force-dynamic';

export default async function CompetitorsPage() {
  const session = await requireAuth();

  // Fetch real brand from database for active organization
  let brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  if (!brand) {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });
    brand = await prisma.brand.create({
      data: {
        organizationId: session.organizationId,
        name: org?.name ? `${org.name} Brand` : 'My Brand',
        industry: '',
        geography: '',
        priceSegment: '',
        websiteUrl: '',
        positioning: '',
        usp: '',
        targetAudience: '',
        onboardingStatus: 'ACTIVE',
      },
    });
  }

  return <CompetitorsClient brandId={brand.id} userRole={session.role} />;
}
