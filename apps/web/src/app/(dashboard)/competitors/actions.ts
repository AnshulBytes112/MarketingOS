'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TenantRepository } from '@abge/tenant';
import { requireAuth, requirePermission } from '@abge/auth';
import { prisma } from '@abge/database';
import { normalizeWebsite, normalizePlatformHandle } from './normalization';

import { createCompetitorSchema, updateCompetitorSchema } from './schemas';
import { getCompetitorIngestionQueue } from '@/lib/queue';

// Helper to perform duplicate check under same brand
async function checkDuplicate(brandId: string, data: z.infer<typeof createCompetitorSchema>, excludeCompetitorId?: string) {
  // Fetch existing competitors for this brand
  const existingCompetitors = await prisma.brandCompetitor.findMany({
    where: { brandId },
  });

  const newNormalizedWebsite = normalizeWebsite(data.websiteUrl);
  const newNormalizedInstagram = normalizePlatformHandle('instagram', data.instagram);
  const newNormalizedFacebook = normalizePlatformHandle('facebook', data.facebook);
  const newNormalizedLinkedin = normalizePlatformHandle('linkedin', data.linkedin);
  const newNormalizedTwitter = normalizePlatformHandle('twitter', data.twitter);
  const newNormalizedYoutube = normalizePlatformHandle('youtube', data.youtube);
  const newNormalizedTiktok = normalizePlatformHandle('tiktok', data.tiktok);

  for (const comp of existingCompetitors) {
    if (excludeCompetitorId && comp.id === excludeCompetitorId) continue;

    // Check website duplicate
    if (newNormalizedWebsite && comp.websiteUrl) {
      if (normalizeWebsite(comp.websiteUrl) === newNormalizedWebsite) {
        throw new Error(`A competitor with the website "${data.websiteUrl}" already exists for this brand.`);
      }
    }

    // Check handles duplicate
    const checkField = (platform: string, newVal: string | null, existingVal: string | null) => {
      if (newVal && existingVal) {
        if (normalizePlatformHandle(platform, existingVal) === newVal) {
          throw new Error(`A competitor with the ${platform} handle "${existingVal}" already exists for this brand.`);
        }
      }
    };

    checkField('instagram', newNormalizedInstagram, comp.instagram);
    checkField('facebook', newNormalizedFacebook, comp.facebook);
    checkField('linkedin', newNormalizedLinkedin, comp.linkedin);
    checkField('twitter', newNormalizedTwitter, comp.twitter);
    checkField('youtube', newNormalizedYoutube, comp.youtube);
    checkField('tiktok', newNormalizedTiktok, comp.tiktok);
  }
}

// Server Actions
export async function getCompetitors(brandId: string) {
  const session = await requireAuth();
  const repo = new TenantRepository(session);
  return repo.getBrandCompetitors(brandId);
}

export async function createCompetitor(brandId: string, rawData: z.infer<typeof createCompetitorSchema>) {
  const session = await requirePermission('manage_competitors');
  
  // Zod validation
  const validated = createCompetitorSchema.parse(rawData);

  // Duplicate Check
  await checkDuplicate(brandId, validated);

  const repo = new TenantRepository(session);
  
  const competitor = await repo.createBrandCompetitorScoped(brandId, {
    name: validated.name,
    websiteUrl: validated.websiteUrl || null,
    instagram: validated.instagram || null,
    facebook: validated.facebook || null,
    linkedin: validated.linkedin || null,
    twitter: validated.twitter || null,
    youtube: validated.youtube || null,
    tiktok: validated.tiktok || null,
  });

  // Automatically trigger sync/ingestion for all configured platforms
  const platforms: string[] = [];
  if (competitor.websiteUrl) platforms.push('website');
  if (competitor.instagram) platforms.push('instagram');
  if (competitor.facebook) platforms.push('facebook');
  if (competitor.linkedin) platforms.push('linkedin');
  if (competitor.twitter) platforms.push('twitter');
  if (competitor.youtube) platforms.push('youtube');
  if (competitor.tiktok) platforms.push('tiktok');

  if (platforms.length > 0) {
    try {
      for (const plat of platforms) {
        await prisma.competitorAccount.upsert({
          where: {
            organizationId_competitorId_platform: {
              organizationId: session.organizationId,
              competitorId: competitor.id,
              platform: plat,
            },
          },
          create: {
            organizationId: session.organizationId,
            brandId,
            competitorId: competitor.id,
            platform: plat,
            handle: plat === 'website' ? competitor.websiteUrl! : (competitor as any)[plat] || 'handle',
            syncStatus: 'PENDING',
            sourceType: plat === 'website' ? 'PUBLIC_WEB' : 'OFFICIAL_API',
          },
          update: {
            syncStatus: 'PENDING',
          },
        });
      }

      const queue = getCompetitorIngestionQueue();
      await queue.add('competitor-ingestion.run', {
        organizationId: session.organizationId,
        brandId,
        competitorId: competitor.id,
        force: true,
      });
    } catch (e) {
      console.error('Failed to trigger automatic competitor sync:', e);
    }
  }

  revalidatePath('/competitors');
  return competitor;
}

export async function updateCompetitor(competitorId: string, brandId: string, rawData: z.infer<typeof updateCompetitorSchema>) {
  const session = await requirePermission('manage_competitors');
  
  // Zod validation
  const validated = updateCompetitorSchema.parse(rawData);

  // Duplicate Check
  await checkDuplicate(brandId, validated, competitorId);

  const repo = new TenantRepository(session);

  const competitor = await repo.updateBrandCompetitorScoped(competitorId, brandId, {
    name: validated.name,
    websiteUrl: validated.websiteUrl || null,
    instagram: validated.instagram || null,
    facebook: validated.facebook || null,
    linkedin: validated.linkedin || null,
    twitter: validated.twitter || null,
    youtube: validated.youtube || null,
    tiktok: validated.tiktok || null,
  });

  revalidatePath('/competitors');
  return competitor;
}

export async function deleteCompetitor(competitorId: string, brandId: string) {
  const session = await requirePermission('manage_competitors');
  const repo = new TenantRepository(session);

  const competitor = await repo.deleteBrandCompetitorScoped(competitorId, brandId);

  revalidatePath('/competitors');
  return competitor;
}
