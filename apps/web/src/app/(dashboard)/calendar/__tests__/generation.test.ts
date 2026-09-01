import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestContentGeneration, retryContentGeneration } from '../actions';
import { prisma } from '@abge/database';
import { enqueueTextGeneration, enqueueVideoGeneration, enqueueImageGeneration } from '../../../../lib/queue';

vi.mock('@abge/database', () => ({
  prisma: {
    strategy: { create: vi.fn(), findUnique: vi.fn() },
    contentItem: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
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
  enqueueQualityScoring: vi.fn(),
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

  describe('Content Studio Editing & Regeneration', () => {
    it('saveContentEdit should create a new version with MANUAL_EDIT source', async () => {
      const { saveContentEdit } = await import('../actions');
      const mockOldGen = { id: 'gen-1', brandId: 'test-brand', contentItemId: 'item-1', organizationId: 'test-org', version: 1 };
      (prisma.contentGeneration.findUnique as any).mockResolvedValue(mockOldGen);
      (prisma.contentGeneration.findFirst as any).mockResolvedValue(mockOldGen);
      (prisma.contentGeneration.create as any).mockResolvedValue({ id: 'gen-2', brandId: 'test-brand' });

      const result = await saveContentEdit('gen-1', 'New Manual Edit Content');

      expect(result.success).toBe(true);
      expect(prisma.contentGeneration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          textContent: 'New Manual Edit Content',
          generationSource: 'MANUAL_EDIT',
          parentVersionId: 'gen-1',
          version: 2
        })
      });
      // Should trigger audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ action: 'CONTENT_EDITED' })
      }));
    });

    it('restoreContentVersion should create a new version with RESTORE source', async () => {
      const { restoreContentVersion } = await import('../actions');
      const mockOldGen = { id: 'gen-1', brandId: 'test-brand', contentItemId: 'item-1', organizationId: 'test-org', version: 1, textContent: 'Old Data' };
      (prisma.contentGeneration.findUnique as any).mockResolvedValue(mockOldGen);
      (prisma.contentGeneration.findFirst as any).mockResolvedValue({ ...mockOldGen, version: 3 }); // Latest is v3
      (prisma.contentGeneration.create as any).mockResolvedValue({ id: 'gen-4', brandId: 'test-brand' });

      const result = await restoreContentVersion('gen-1', 'item-1');

      expect(result.success).toBe(true);
      expect(prisma.contentGeneration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          textContent: 'Old Data',
          generationSource: 'RESTORE',
          parentVersionId: 'gen-1',
          version: 4
        })
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ action: 'CONTENT_VERSION_RESTORED' })
      }));
    });

    it('regenerateContentWithInstruction should trigger AI_REGENERATION with instruction', async () => {
      const { regenerateContentWithInstruction } = await import('../actions');
      const mockItem = { id: 'item-1', organizationId: 'test-org', brandId: 'test-brand', strategy: {} };
      (prisma.contentItem.findUnique as any).mockResolvedValue(mockItem);
      (prisma.contentGeneration.findFirst as any)
        .mockResolvedValueOnce(null) // activeGen check
        .mockResolvedValueOnce({ id: 'gen-1', version: 1 }); // latestGen check
      (prisma.contentGeneration.create as any).mockResolvedValue({ id: 'gen-2', brandId: 'test-brand' });

      const result = await regenerateContentWithInstruction('item-1', 'Make it funnier');

      expect(result.success).toBe(true);
      expect(prisma.contentGeneration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          generationSource: 'AI_REGENERATION',
          generationInstruction: 'Make it funnier',
          parentVersionId: 'gen-1',
          textStatus: 'QUEUED',
          version: 2
        })
      });
      expect(enqueueTextGeneration).toHaveBeenCalled();
    });

    it('markContentReadyForReview should update status to READY_FOR_REVIEW', async () => {
      const { markContentReadyForReview } = await import('../actions');
      (prisma.contentItem.findUnique as any).mockResolvedValue({ id: 'item-1', organizationId: 'test-org' });

      const result = await markContentReadyForReview('item-1');

      expect(result.success).toBe(true);
      expect(prisma.contentItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { status: 'READY_FOR_REVIEW' }
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ action: 'CONTENT_STATUS_CHANGED' })
      }));
    });
  });
});
