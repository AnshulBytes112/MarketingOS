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
      baseURL: process.env.AI_BASE_URL,
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
    const maxAttempts = 5;

    // Use environment variables or modelOverride
    const provider = process.env.AI_PROVIDER;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    
    // Validate provider
    if (provider && provider !== 'openai') {
       throw new Error(`Unsupported AI_PROVIDER configured: ${provider}`);
    }

    const inputPriceRaw = process.env.AI_INPUT_PRICE_PER_1M_TOKENS;
    const outputPriceRaw = process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS;

    while (attempts < maxAttempts) {
      try {
        console.log(`[${requestId}] Generating structured output with model ${model} (Attempt ${attempts + 1}/${maxAttempts})`);
        
        const response = await this.openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        });

        const message = response.choices[0]?.message;
        if (!message || message.refusal) {
          throw new Error(message?.refusal || 'No valid message returned');
        }

        let rawContent = message.content || '{}';

        // Try to find markdown json block
        const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (match) {
          rawContent = match[1].trim();
        } else {
          // Fallback: extract substring from first { to last }
          const firstBrace = rawContent.indexOf('{');
          const lastBrace = rawContent.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            rawContent = rawContent.substring(firstBrace, lastBrace + 1);
          }
        }

        let rawData = JSON.parse(rawContent);
        if (!rawData) {
          throw new Error('Failed to parse structured output natively');
        }

        // If the AI returned an array directly, but the Zod schema expects an object
        // with a single key (e.g. { recommendations: [...] }), automatically wrap it.
        if (Array.isArray(rawData) && schema && typeof schema === 'object' && 'shape' in (schema as any)) {
          const shapeKeys = Object.keys((schema as any).shape);
          if (shapeKeys.length === 1) {
            rawData = { [shapeKeys[0]]: rawData };
          }
        }
        
        // Strictly validate and coerce using the provided Zod schema
        const data = schema.parse(rawData);

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
