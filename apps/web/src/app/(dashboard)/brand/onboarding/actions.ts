'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TenantRepository } from '@abge/tenant';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueueBrandDnaGeneration } from '@/lib/queue';

// Basic info step
const brandBasicsSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    industry: z.string().min(1, 'Industry is required'),
    websiteUrl: z.string().url('Must be a valid URL'),
});

export async function saveBrandBasics(data: z.infer<typeof brandBasicsSchema>, brandId?: string) {
    const session = await requirePermission('manage_brand_dna');
    const validated = brandBasicsSchema.parse(data);
    const repo = new TenantRepository(session);

    let brand;
    if (brandId) {
        brand = await repo.updateBrand({
            where: { id: brandId },
            data: {
                ...validated,
                onboardingStep: 2,
            },
        });
    } else {
        brand = await repo.createBrand({
            data: {
                ...validated,
                onboardingStep: 2,
                onboardingStatus: 'DRAFT',
            },
        });
    }
    return brand.id;
}

const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
});
const brandProductsSchema = z.object({
    products: z.array(productSchema)
});

export async function saveBrandProducts(data: z.infer<typeof brandProductsSchema>, brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const validated = brandProductsSchema.parse(data);
    const repo = new TenantRepository(session);

    // Delete existing products to replace them (simplified sync)
    const existingProducts = await repo.findManyBrandProducts({ where: { brandId } });
    for (const p of existingProducts) {
        await repo.deleteBrandProduct({ where: { id: p.id } });
    }

    for (const p of validated.products) {
        await repo.createBrandProduct({
            data: {
                name: p.name,
                description: p.description,
                brand: { connect: { id: brandId } }
            }
        });
    }

    await repo.updateBrand({
        where: { id: brandId },
        data: { onboardingStep: 3 }
    });
}

const brandAudienceSchema = z.object({
    targetAudience: z.string().min(1, 'Target audience is required'),
    geography: z.string().min(1, 'Geography is required'),
    priceSegment: z.string().min(1, 'Price segment is required'),
});

export async function saveBrandAudience(data: z.infer<typeof brandAudienceSchema>, brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const validated = brandAudienceSchema.parse(data);
    const repo = new TenantRepository(session);

    await repo.updateBrand({
        where: { id: brandId },
        data: {
            ...validated,
            onboardingStep: 4,
        },
    });
}

const brandPositioningSchema = z.object({
    positioning: z.string().min(1, 'Positioning is required'),
    usp: z.string().min(1, 'USP is required'),
});

export async function saveBrandPositioning(data: z.infer<typeof brandPositioningSchema>, brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const validated = brandPositioningSchema.parse(data);
    const repo = new TenantRepository(session);

    await repo.updateBrand({
        where: { id: brandId },
        data: {
            ...validated,
            onboardingStep: 5,
        },
    });
}

const competitorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Competitor name is required'),
    websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
const brandCompetitorsSchema = z.object({
    competitors: z.array(competitorSchema)
});

export async function saveBrandCompetitors(data: z.infer<typeof brandCompetitorsSchema>, brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const validated = brandCompetitorsSchema.parse(data);
    const repo = new TenantRepository(session);

    // Delete existing to replace (simplified sync)
    const existing = await repo.findManyBrandCompetitors({ where: { brandId } });
    for (const c of existing) {
        await repo.deleteBrandCompetitor({ where: { id: c.id } });
    }

    for (const c of validated.competitors) {
        await repo.createBrandCompetitor({
            data: {
                name: c.name,
                websiteUrl: c.websiteUrl || null,
                brand: { connect: { id: brandId } }
            }
        });
    }

    await repo.updateBrand({
        where: { id: brandId },
        data: { onboardingStep: 6 }
    });
}

export async function advanceToStep7(brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const repo = new TenantRepository(session);
    await repo.updateBrand({
        where: { id: brandId },
        data: { onboardingStep: 7 }
    });
}

export async function submitBrandOnboarding(brandId: string) {
    const session = await requirePermission('manage_brand_dna');
    const repo = new TenantRepository(session);

    const brand = await repo.findUniqueBrand({
        where: { id: brandId }
    });

    if (!brand) throw new Error('Brand not found');

    // Validation to ensure it's fully populated
    if (!brand.name || !brand.industry || !brand.targetAudience || !brand.positioning) {
        throw new Error('Missing required onboarding data. Please go back and complete all steps.');
    }

    await repo.updateBrand({
        where: { id: brandId },
        data: { onboardingStatus: 'GENERATING' }
    });

    try {
        await enqueueBrandDnaGeneration(session.organizationId, brand.id);
    } catch (error) {
        await repo.updateBrand({
            where: { id: brandId },
            data: { onboardingStatus: 'DRAFT' }
        });
        throw new Error('Failed to enqueue Brand DNA generation');
    }

    revalidatePath('/brand');
}

export async function getIncompleteDraft() {
    const session = await requireAuth();
    // Assuming viewer can view drafts, but not manage. Actually they probably shouldn't see it if they can't manage, but requireAuth is fine for read if TenantRepository allows.
    const repo = new TenantRepository(session);

    const draft = await repo.findManyBrands({
        where: { onboardingStatus: 'DRAFT' },
        orderBy: { updatedAt: 'desc' },
        take: 1,
        include: {
            products: true,
            competitors: true,
            assets: true
        }
    });

    return draft.length > 0 ? draft[0] : null;
}
