import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const schemaPath = path.resolve(__dirname, 'prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const lines = schema.split('\n');
  const models: string[] = [];
  const enums: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('model ')) {
      models.push(trimmed);
    } else if (trimmed.startsWith('enum ')) {
      enums.push(trimmed);
    }
  }
  
  console.log('--- MODELS ---');
  models.forEach(m => console.log(m));
  console.log('\n--- ENUMS ---');
  enums.forEach(e => console.log(e));
}
main().catch(console.error);
