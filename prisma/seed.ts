import { PrismaClient, Role } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')

  // Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  })

  // Demo Brand
  const brand = await prisma.brand.findFirst({
    where: { organizationId: org.id, name: 'Demo Brand' },
  })
  if (!brand) {
    await prisma.brand.create({
      data: {
        name: 'Demo Brand',
        organizationId: org.id,
      },
    })
  }

  // 8 Fixed Roles & Demo Users
  const roles = [
    Role.OWNER,
    Role.ADMIN,
    Role.MARKETING_MANAGER,
    Role.CONTENT_MANAGER,
    Role.DESIGNER,
    Role.ANALYST,
    Role.APPROVER,
    Role.VIEWER,
  ]

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]
    const email = `${role.toLowerCase()}@demo.com`

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Demo ${role}`,
      },
    })

    // Add to Org
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
    })

    if (!member) {
      await prisma.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role,
        },
      })
    }
  }

  console.log('Seed completed successfully.')
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
