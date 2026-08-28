import { requireAuth } from '@abge/auth';
import { prisma } from '@abge/database';
import BrandIntelligenceClient from './brand-intelligence-client';

export default async function BrandIntelligencePage() {
  const session = await requireAuth();

  // Fetch real brand from database for active organization
  let brand = await prisma.brand.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
  });

  // Auto-provision brand record if not yet created in DB
  if (!brand) {
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });

    brand = await prisma.brand.create({
      data: {
        organizationId: session.organizationId,
        name: org?.name || 'My Brand',
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

  const brandData = {
    id: brand.id,
    name: brand.name,
    industry: brand.industry || 'Not Specified',
    geography: brand.geography || 'Not Specified',
    priceSegment: brand.priceSegment || 'Not Specified',
    websiteUrl: brand.websiteUrl || 'Not Specified',
    positioning: brand.positioning || '',
    usp: brand.usp || '',
    targetAudience: brand.targetAudience || '',
  };

  const permissions = {
    canView: session.effectivePermissions.includes('brand_dna.view'),
    canEdit: session.effectivePermissions.includes('brand_dna.edit'),
  };

  return <BrandIntelligenceClient brand={brandData} organizationId={session.organizationId} permissions={permissions} />;
}
