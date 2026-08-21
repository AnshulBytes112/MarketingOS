import { describe, it, expect, vi } from 'vitest';
import { ModelGateway } from '../../src/ai/gateway';
import { z } from 'zod';

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      beta = {
        chat: {
          completions: {
            parse: vi.fn().mockResolvedValue({
              choices: [{ message: { parsed: { success: true } } }],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
              }
            })
          }
        }
      }
    }
  };
});

describe('Model Gateway', () => {
  it('correctly maps successful parsed output and calculates usage', async () => {
    const gateway = new ModelGateway();
    const schema = z.object({ success: z.boolean() });
    
    const result = await gateway.generateStructured(
      'gpt-4o-mini',
      'sys',
      'user',
      schema,
      'TestSchema',
      'desc',
      'req-1'
    );
    
    expect(result.data).toEqual({ success: true });
    expect(result.usage.inputTokens).toBe(10);
    expect(result.usage.outputTokens).toBe(20);
    // 10 * 0.15/M + 20 * 0.60/M
    const expectedCost = (10 * 0.15 / 1000000) + (20 * 0.60 / 1000000);
    expect(result.usage.estimatedCost).toBeCloseTo(expectedCost);
  });
});
