import { prisma } from '../packages/database/src/client';
console.log(Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
