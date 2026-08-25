import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelGateway } from './gateway';
import { z } from 'zod';

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"success": true}' } }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 20,
              total_tokens: 30
            }
          })
        }
      };
    }
  };
});

describe('Model Gateway', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.AI_PROVIDER = 'openai';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('correctly calculates cost from environment variables', async () => {
    process.env.AI_INPUT_PRICE_PER_1M_TOKENS = '0.150';
    process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS = '0.600';
    process.env.AI_MODEL = 'gpt-4o-mini';

    const gateway = new ModelGateway();
    const schema = z.object({ success: z.boolean() });
    
    const result = await gateway.generateStructured(
      null,
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
    
    // Cost formula test: (10 * 0.150 / 1M) + (20 * 0.600 / 1M)
    const expectedCost = (10 * 0.150 / 1000000) + (20 * 0.600 / 1000000);
    expect(result.usage.estimatedCost).toBeCloseTo(expectedCost);
  });

  it('returns null for estimatedCost if env variables are missing', async () => {
    delete process.env.AI_INPUT_PRICE_PER_1M_TOKENS;
    delete process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS;

    const gateway = new ModelGateway();
    const schema = z.object({ success: z.boolean() });
    
    const result = await gateway.generateStructured(
      null,
      'sys',
      'user',
      schema,
      'TestSchema',
      'desc',
      'req-2'
    );

    expect(result.usage.estimatedCost).toBeNull();
  });

  it('throws an error if an unsupported AI_PROVIDER is passed', async () => {
    process.env.AI_PROVIDER = 'anthropic';
    const gateway = new ModelGateway();
    const schema = z.object({ success: z.boolean() });

    await expect(gateway.generateStructured(
      null,
      'sys',
      'user',
      schema,
      'TestSchema',
      'desc',
      'req-3'
    )).rejects.toThrow('Unsupported AI_PROVIDER configured: anthropic');
  });
});
