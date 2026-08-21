import OpenAI from 'openai';
import { z } from 'zod';

export interface AIUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCost: number | null;
}

export interface ModelGatewayResponse<T> {
  data: T;
  usage: AIUsageMetrics;
}

export class ModelGateway {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateStructured<T>(
    modelOverride: string | null,
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    schemaDescription: string,
    requestId: string,
  ): Promise<ModelGatewayResponse<T>> {
    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 3;

    // Use environment variables or modelOverride
    const provider = process.env.AI_PROVIDER;
    const model = modelOverride || process.env.AI_MODEL || 'gpt-4o-mini';
    
    // Validate provider
    if (provider && provider !== 'openai') {
       throw new Error(`Unsupported AI_PROVIDER configured: ${provider}`);
    }

    const inputPriceRaw = process.env.AI_INPUT_PRICE_PER_1M_TOKENS;
    const outputPriceRaw = process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS;

    while (attempts < maxAttempts) {
      try {
        console.log(`[${requestId}] Generating structured output with model ${model} (Attempt ${attempts + 1}/${maxAttempts})`);
        
        const response = await (this.openai.beta as any).chat.completions.parse({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: schemaName,
              description: schemaDescription,
              schema: Object.assign({}, require('zod-to-json-schema').zodToJsonSchema(schema), { additionalProperties: false }) as any,
              strict: true
            }
          }
        });

        const message = response.choices[0]?.message;
        if (!message || message.refusal) {
          throw new Error(message?.refusal || 'No valid message returned');
        }

        const data = message.parsed as T;
        if (!data) {
          throw new Error('Failed to parse structured output natively');
        }

        const latencyMs = Date.now() - startTime;
        const usage = response.usage;
        const inputTokens = usage?.prompt_tokens || 0;
        const outputTokens = usage?.completion_tokens || 0;
        const totalTokens = usage?.total_tokens || 0;

        let estimatedCost: number | null = null;

        if (inputPriceRaw && outputPriceRaw) {
          const inputPrice = parseFloat(inputPriceRaw);
          const outputPrice = parseFloat(outputPriceRaw);
          if (!isNaN(inputPrice) && !isNaN(outputPrice)) {
            estimatedCost = (inputTokens * (inputPrice / 1000000)) + (outputTokens * (outputPrice / 1000000));
          }
        }

        return {
          data,
          usage: {
            inputTokens,
            outputTokens,
            totalTokens,
            latencyMs,
            estimatedCost,
          }
        };

      } catch (error) {
        attempts++;
        console.error(`[${requestId}] Generation attempt ${attempts} failed:`, error);
        
        if (attempts >= maxAttempts) {
          throw error; // Let the caller handle the final failure
        }
        
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempts - 1) * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }

    throw new Error('Unreachable code block in generateStructured');
  }
}
