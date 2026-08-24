import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

async function main() {
  const models = await openai.models.list();
  console.log(models.data.map(m => m.id));
}

main();
