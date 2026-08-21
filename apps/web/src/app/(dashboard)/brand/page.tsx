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

    try {
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
    } catch (e) {
      brand = {
        id: 'build-mock',
        organizationId: session.organizationId,
        name: 'NovaBrew Coffee',
        industry: 'Food & Beverage',
        geography: 'United States',
        priceSegment: 'Premium',
        websiteUrl: 'novabrew.com',
        positioning: 'Sustainable specialty coffee for the modern professional',
        usp: 'Single-origin, ethically sourced beans with AI-powered roast profiles',
        targetAudience: 'Urban professionals 25-40',
        onboardingStatus: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
  }

  const brandData = {
    id: brand!.id,
    name: brand!.name || 'NovaBrew Coffee',
    industry: brand!.industry || 'Food & Beverage',
    geography: brand!.geography || 'United States',
    priceSegment: brand!.priceSegment || 'Premium',
    websiteUrl: brand!.websiteUrl || 'novabrew.com',
    positioning: brand!.positioning || 'Sustainable specialty coffee for the modern professional',
    usp: brand!.usp || 'Single-origin, ethically sourced beans with AI-powered roast profiles',
    targetAudience: brand!.targetAudience || 'Urban professionals 25-40',
  };

  return <BrandIntelligenceClient brand={brandData} />;
}
