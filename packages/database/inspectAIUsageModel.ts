import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const schemaPath = path.resolve(__dirname, 'prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const lines = schema.split('\n');
  let print = false;
  let braces = 0;
  for (const line of lines) {
    if (line.trim().startsWith('model AIUsage ')) {
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
main().catch(console.error);
