'use server';

import { prisma } from '@abge/database';
import { requireAuth, requirePermission } from '@abge/auth';
import { enqueueSeoAnalysis, enqueueTextGeneration } from '../../../lib/queue';

export async function requestSEOAnalysis(contentVersionId: string) {
  const session = await requireAuth();
  await requirePermission('seo.analyze');

  const version = await prisma.contentGeneration.findUnique({
    where: { id: contentVersionId },
    include: { contentItem: true }
  });

  if (!version) throw new Error('Content version not found');
  if (version.organizationId !== session.organizationId) throw new Error('Tenant isolation violation');

  // Verify no current analysis is pending
  const existingAnalysis = await prisma.sEOAnalysis.findFirst({
    where: { contentVersionId, organizationId: session.organizationId, status: 'ANALYZING' }
  });

  if (existingAnalysis) {
    throw new Error('An SEO analysis is already running for this version.');
  }

  // Create the SEO Analysis record with ANALYZING status
  const analysis = await prisma.sEOAnalysis.create({
    data: {
      organizationId: session.organizationId,
      brandId: version.brandId,
      contentItemId: version.contentItemId,
      contentVersionId,
      status: 'ANALYZING'
    }
  });

  // Enqueue job
  await enqueueSeoAnalysis({
    organizationId: session.organizationId,
    brandId: version.brandId,
    contentVersionId,
    contentItemId: version.contentItemId,
    userId: session.userId,
    analysisId: analysis.id,
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'SEO_ANALYSIS_REQUESTED',
      entityType: 'ContentGeneration',
      entityId: contentVersionId,
    }
  });

  return { success: true };
}

export async function getLatestSEOAnalysis(contentVersionId: string) {
  const session = await requireAuth();
  await requirePermission('seo.view');

  const analysis = await prisma.sEOAnalysis.findFirst({
    where: {
      contentVersionId,
      organizationId: session.organizationId
    },
    orderBy: { createdAt: 'desc' }
  });

  return analysis;
}

export async function applySEOOptimization(contentVersionId: string, recommendationsText: string) {
  const session = await requireAuth();
  await requirePermission('seo.optimize');

  const oldGen = await prisma.contentGeneration.findUnique({
    where: { id: contentVersionId },
    include: { contentItem: true }
  });

  if (!oldGen || oldGen.organizationId !== session.organizationId) {
    throw new Error('Not found or tenant violation');
  }

  const latestGen = await prisma.contentGeneration.findFirst({
    where: { contentItemId: oldGen.contentItemId },
    orderBy: { version: 'desc' }
  });
  
  const newVersion = (latestGen?.version || 0) + 1;

  // We are creating a NEW immutable version
  const newGen = await prisma.contentGeneration.create({
    data: {
      organizationId: session.organizationId,
      brandId: oldGen.brandId,
      contentItemId: oldGen.contentItemId,
      version: newVersion,
      textStatus: 'QUEUED',
      imageStatus: oldGen.imageStatus,
      videoStatus: oldGen.videoStatus,
      textContent: oldGen.textContent || undefined, // Copy old text so it can be overwritten by text-generation or manually checked
      brandDnaVersionId: oldGen.brandDnaVersionId,
      strategyVersion: oldGen.strategyVersion,
      sourceIds: oldGen.sourceIds || [],
      generationSource: 'SEO_OPTIMIZATION',
      generationInstruction: `Apply the following SEO recommendations:\n${recommendationsText}`,
      parentVersionId: contentVersionId,
    }
  });

  await prisma.auditLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'SEO_OPTIMIZATION_REQUESTED',
      entityType: 'ContentGeneration',
      entityId: newGen.id,
      metadata: { originalVersionId: contentVersionId }
    }
  });

  // Re-run text generation with the instructions
  await enqueueTextGeneration({
    generationId: newGen.id,
    organizationId: session.organizationId,
    brandId: newGen.brandId,
    contentItemId: newGen.contentItemId,
  });

  return { success: true, generationId: newGen.id };
}

export async function getSeoOverview(organizationId: string, filters: { from: Date; to: Date }) {
  const session = await requireAuth();
  await requirePermission('seo.view');

  if (session.organizationId !== organizationId) {
    throw new Error('Tenant isolation violation');
  }

  // Get all completed analyses for the time period
  const analyses = await prisma.sEOAnalysis.findMany({
    where: {
      organizationId,
      status: 'COMPLETED',
      createdAt: {
        gte: filters.from,
        lte: filters.to
      }
    },
    include: {
      contentItem: {
        select: { id: true, title: true, platform: true, format: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate aggregates
  const total = analyses.length;
  const averageScore = total > 0 ? Math.round(analyses.reduce((acc, curr) => acc + (curr.seoScore || 0), 0) / total) : 0;
  
  const needsOptimization = analyses.filter(a => (a.seoScore || 0) < 70).map(a => ({
    id: a.id,
    contentItemId: a.contentItem.id,
    title: a.contentItem.title,
    platform: a.contentItem.platform,
    format: a.contentItem.format,
    score: a.seoScore,
    searchIntent: a.searchIntent,
    date: a.createdAt
  }));

  const topPerforming = analyses.filter(a => (a.seoScore || 0) >= 80).map(a => ({
    id: a.id,
    contentItemId: a.contentItem.id,
    title: a.contentItem.title,
    platform: a.contentItem.platform,
    format: a.contentItem.format,
    score: a.seoScore,
    searchIntent: a.searchIntent,
    date: a.createdAt
  }));

  return {
    totalAnalyzed: total,
    averageScore,
    needsOptimization,
    topPerforming
  };
}
