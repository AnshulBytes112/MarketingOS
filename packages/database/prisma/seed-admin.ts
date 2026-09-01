import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import path from 'path'
import bcrypt from 'bcryptjs'

dotenv.config({ path: 'c:\\Users\\ANSHUL\\SocialMediaDigitalMarketingOS\\SocialMediaDigitalMarketingOS\\.env' })

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding admin...')
  
  const email = 'admin@demo.com'
  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.platformAdmin.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: 'Super Admin',
    },
  })

  console.log('PlatformAdmin created/updated successfully:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
