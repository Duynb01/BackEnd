import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Seed Role
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'USER' },
    ],
    skipDuplicates: true,
  })

  // Seed Category
  await prisma.category.createMany({
    data: [
      { name: 'SOFA - GHẾ THƯ GIÃN', slug: 'sofa-ghe-thu-gian' },
      { name: 'BÀN', slug: 'ban' },
      { name: 'GHẾ', slug: 'ghe' },
      { name: 'GIƯỜNG - NỆM', slug: 'giuong-name' },
      { name: 'TỦ - KỆ', slug: 'tu-ke' },
      { name: 'TRANG TRÍ', slug: 'trang-tri' },
      { name: 'NHÀ BẾP', slug: 'nha-bep' },
      { name: 'PHÒNG TẮM', slug: 'phong-tam' },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(async () => {
    console.log('✅ Seed done!')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
