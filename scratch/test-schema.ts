import { BrandDNASchema } from '../apps/worker/src/brand-dna.schema';
import { zodToJsonSchema } from 'zod-to-json-schema';

console.log(JSON.stringify(zodToJsonSchema(BrandDNASchema as any, 'BrandDNA'), null, 2));
