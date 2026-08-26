import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestContentGeneration, retryContentGeneration } from '../actions';
import { prisma } from '@abge/database';
import { enqueueTextGeneration, enqueueVideoGeneration, enqueueImageGeneration } from '../../../../lib/queue';

vi.mock('@abge/database', () => ({
  prisma: {
    strategy: { create: vi.fn(), findUnique: vi.fn() },
    contentItem: { create: vi.fn(), findUnique: vi.fn() },
    contentGeneration: { create: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  }
}));

vi.mock('@abge/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    userId: 'test-user',
    organizationId: 'test-org',
  }),
  requirePermission: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../../lib/queue', () => ({
  enqueueTextGeneration: vi.fn(),
  enqueueImageGeneration: vi.fn(),
  enqueueVideoGeneration: vi.fn(),
}));

describe('Content Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully trigger independent pipelines', async () => {
    // 1. Setup mock data in Prisma
    const mockStrategy = { id: 'test-strategy', status: 'COMPLETED', publicationStatus: 'ACTIVE' };
    const mockItem = { id: 'test-item', format: 'reel', platform: 'instagram', strategy: mockStrategy, brandId: 'test-brand', organizationId: 'test-org' };
    
    (prisma.contentItem.findUnique as any).mockResolvedValue(mockItem);
    (prisma.contentGeneration.findFirst as any).mockResolvedValue(null); // No active generation
    (prisma.contentGeneration.create as any).mockResolvedValue({ id: 'test-gen', version: 1, textStatus: 'QUEUED', videoStatus: 'QUEUED', imageStatus: 'NOT_CONFIGURED' });

    // 2. Request generation
    const result = await requestContentGeneration(mockItem.id);
    expect(result.success).toBe(true);

    // 3. Verify specific modalities based on 'reel' format
    expect(prisma.contentGeneration.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        textStatus: 'QUEUED',
        videoStatus: 'QUEUED',
        imageStatus: 'NOT_CONFIGURED'
      })
    }));

    // 4. Verify queue enqueue calls
    expect(enqueueTextGeneration).toHaveBeenCalled();
    expect(enqueueVideoGeneration).toHaveBeenCalled();
    expect(enqueueImageGeneration).not.toHaveBeenCalled();
  });

  it('should prevent duplicate generations (idempotency)', async () => {
    const mockStrategy = { id: 'test-strategy', status: 'COMPLETED', publicationStatus: 'ACTIVE' };
    const mockItem = { id: 'test-item', format: 'post', platform: 'linkedin', strategy: mockStrategy, brandId: 'test-brand', organizationId: 'test-org' };
    
    (prisma.contentItem.findUnique as any).mockResolvedValue(mockItem);
    // Simulate an active generation
    (prisma.contentGeneration.findFirst as any).mockResolvedValue({ id: 'active-gen', textStatus: 'GENERATING' });

    // Request should fail
    await expect(requestContentGeneration(mockItem.id)).rejects.toThrow('A generation is already in progress');
  });

  it('should isolate failures when retrying a single modality', async () => {
    const mockGen = {
      id: 'test-gen',
      organizationId: 'test-org',
      brandId: 'test-brand',
      contentItemId: 'test-item',
      textStatus: 'COMPLETED',
      imageStatus: 'FAILED',
      videoStatus: 'NOT_CONFIGURED',
      contentItem: {}
    };

    (prisma.contentGeneration.findUnique as any).mockResolvedValue(mockGen);
    (prisma.contentGeneration.update as any).mockResolvedValue({});

    // 2. Retry image
    const result = await retryContentGeneration(mockGen.id, 'IMAGE');
    expect(result.success).toBe(true);

    expect(prisma.contentGeneration.update).toHaveBeenCalledWith({
      where: { id: mockGen.id },
      data: { imageStatus: 'QUEUED' }
    });
    
    // Only image queue is called
    expect(enqueueTextGeneration).not.toHaveBeenCalled();
    expect(enqueueImageGeneration).toHaveBeenCalled();
  });
});
