import * as fs from 'fs';
import * as path from 'path';

const targetModels = [
  'Brand',
  'BrandCompetitor',
  'CompetitorAccount',
  'CompetitorPost',
  'Strategy',
  'Campaign',
  'ContentItem',
  'ContentGeneration',
  'ContentMetricSnapshot',
  'SEOAnalysis',
  'AIRecommendation'
];

async function main() {
  const schemaPath = path.resolve(__dirname, 'prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const lines = schema.split('\n');
  
  for (const target of targetModels) {
    let print = false;
    let braces = 0;
    console.log(`\n========================================\nMODEL: ${target}\n========================================`);
    for (const line of lines) {
      if (line.trim().startsWith(`model ${target} `) || line.trim() === `model ${target} {`) {
        print = true;
      }
      if (print) {
        console.log(line);
        if (line.includes('{')) braces++;
        if (line.includes('}')) braces--;
        if (braces === 0 && line.includes('}')) {
          print = false;
        }
      }
    }
  }
}
main().catch(console.error);
