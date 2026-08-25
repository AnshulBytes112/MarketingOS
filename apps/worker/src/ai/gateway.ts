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
      baseURL: process.env.AI_BASE_URL || undefined,
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
    if (provider !== 'openai' && provider !== 'gemini') {
       throw new Error(`Unsupported AI_PROVIDER configured: ${provider}. Must be 'openai' or 'gemini'`);
    }

    if (provider === 'gemini' && (!process.env.AI_BASE_URL || !process.env.AI_BASE_URL.includes('generativelanguage.googleapis.com'))) {
       throw new Error(`Invalid AI_BASE_URL for Gemini. Must include 'generativelanguage.googleapis.com' when AI_PROVIDER is 'gemini'.`);
    }

    const inputPriceRaw = process.env.AI_INPUT_PRICE_PER_1M_TOKENS;
    const outputPriceRaw = process.env.AI_OUTPUT_PRICE_PER_1M_TOKENS;

    while (attempts < maxAttempts) {
      try {
        console.log(`[${requestId}] Generating structured output with model ${model} (Attempt ${attempts + 1}/${maxAttempts})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s hard timeout per attempt
        let response;
        try {
          response = await this.openai.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          }, { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }

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

        // If the AI wrapped the response in a single top-level key (e.g. { strategy: {...} })
        // and that single value is an object (not an array), unwrap it automatically.
        // This handles models that hallucinate a wrapper like { "strategy": { goal: ... } }.
        if (
          !Array.isArray(rawData) &&
          typeof rawData === 'object' &&
          rawData !== null &&
          schema &&
          'shape' in (schema as any)
        ) {
          const schemaKeys = new Set(Object.keys((schema as any).shape));
          const dataKeys = Object.keys(rawData);
          const topLevelMatchCount = dataKeys.filter(k => schemaKeys.has(k)).length;
          // If NONE of the top-level keys match the schema, but there is exactly one key whose value is an object,
          // assume it is a wrapper and unwrap it.
          if (topLevelMatchCount === 0 && dataKeys.length === 1) {
            const wrappedValue = rawData[dataKeys[0]];
            if (typeof wrappedValue === 'object' && wrappedValue !== null && !Array.isArray(wrappedValue)) {
              console.log(`[${requestId}] AI returned wrapped object under key "${dataKeys[0]}". Unwrapping automatically.`);
              rawData = wrappedValue;
            }
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

      } catch (error: any) {
        attempts++;
        console.error(`[${requestId}] Generation attempt ${attempts} failed:`, error.message);
        
        // Check for permanent client errors (400, 401, 403, 404)
        const status = error.status || error.statusCode || error.code;
        if (status === 400 || status === 401 || status === 403 || status === 404 || status === '404') {
          console.error(`[${requestId}] Permanent error encountered (${status}). Halting retries.`);
          throw error;
        }

        if (attempts >= maxAttempts) {
          throw error; // Let the caller handle the final failure
        }
        
        let delay = Math.pow(2, attempts) * 1000;
        if (status === 429 || status === '429') {
          console.log(`[${requestId}] Rate limit (429) hit. Backing off for 60s...`);
          delay = 60000;
        } else {
          console.log(`[${requestId}] Retrying in ${delay}ms...`);
        }
        
        await new Promise(res => setTimeout(res, delay));
      }
    }

    throw new Error('Unreachable code block in generateStructured');
  }
}
