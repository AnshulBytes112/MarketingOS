import { prisma } from './src/client'; 
async function main() { 
  const versions = await prisma.brandDNAVersion.findMany(); 
  console.log(JSON.stringify(versions.map(v => ({ id: v.id, version: v.version, status: v.status, pub: v.publicationStatus, demographics: !!v.demographics })), null, 2)); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
