"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const gateway_1 = require("./gateway");
const zod_1 = require("zod");
vitest_1.vi.mock('openai', () => {
    return {
        default: class MockOpenAI {
            beta = {
                chat: {
                    completions: {
                        parse: vitest_1.vi.fn().mockResolvedValue({
                            choices: [{ message: { parsed: { success: true } } }],
                            usage: {
                                prompt_tokens: 10,
                                completion_tokens: 20,
                                total_tokens: 30
                            }
                        })
                    }
                }
            };
        }
    };
});
(0, vitest_1.describe)('Model Gateway', () => {
    const originalEnv = process.env;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        process.env = { ...originalEnv };
    });
    (0, vitest_1.afterEach)(() => {
        process.env = originalEnv;
    });
    (0, vitest_1.it)('correctly calculates cost from environment variables', async () => {
        process.env.AI_INPUT_PRICE_PER_1M_TOKENS = '0.150';
        process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS = '0.600';
        process.env.AI_MODEL = 'gpt-4o-mini';
        const gateway = new gateway_1.ModelGateway();
        const schema = zod_1.z.object({ success: zod_1.z.boolean() });
        const result = await gateway.generateStructured(null, 'sys', 'user', schema, 'TestSchema', 'desc', 'req-1');
        (0, vitest_1.expect)(result.data).toEqual({ success: true });
        (0, vitest_1.expect)(result.usage.inputTokens).toBe(10);
        (0, vitest_1.expect)(result.usage.outputTokens).toBe(20);
        // Cost formula test: (10 * 0.150 / 1M) + (20 * 0.600 / 1M)
        const expectedCost = (10 * 0.150 / 1000000) + (20 * 0.600 / 1000000);
        (0, vitest_1.expect)(result.usage.estimatedCost).toBeCloseTo(expectedCost);
    });
    (0, vitest_1.it)('returns null for estimatedCost if env variables are missing', async () => {
        delete process.env.AI_INPUT_PRICE_PER_1M_TOKENS;
        delete process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS;
        const gateway = new gateway_1.ModelGateway();
        const schema = zod_1.z.object({ success: zod_1.z.boolean() });
        const result = await gateway.generateStructured(null, 'sys', 'user', schema, 'TestSchema', 'desc', 'req-2');
        (0, vitest_1.expect)(result.usage.estimatedCost).toBeNull();
    });
    (0, vitest_1.it)('throws an error if an unsupported AI_PROVIDER is passed', async () => {
        process.env.AI_PROVIDER = 'anthropic';
        const gateway = new gateway_1.ModelGateway();
        const schema = zod_1.z.object({ success: zod_1.z.boolean() });
        await (0, vitest_1.expect)(gateway.generateStructured(null, 'sys', 'user', schema, 'TestSchema', 'desc', 'req-3')).rejects.toThrow('Unsupported AI_PROVIDER configured: anthropic');
    });
});
