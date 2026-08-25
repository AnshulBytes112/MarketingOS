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
        name: org?.name ? `${org.name} Coffee` : 'NovaBrew Coffee',
        industry: 'Food & Beverage',
        geography: 'United States',
        priceSegment: 'Premium',
        websiteUrl: 'novabrew.com',
        positioning: 'Sustainable specialty coffee for the modern professional',
        usp: 'Single-origin, ethically sourced beans with AI-powered roast profiles',
        targetAudience: 'Urban professionals 25-40',
        onboardingStatus: 'ACTIVE',
      },
    });
  }

  return <CompetitorsClient brandId={brand.id} userRole={session.role} />;
}
