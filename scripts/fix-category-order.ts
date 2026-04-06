import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function fixCategoryOrder() {
  try {
    console.log('🔧 Fixing category order values...')

    // Get all categories ordered by creation date
    const categories = await db.category.findMany({
      orderBy: [
        { createdAt: 'asc' }
      ]
    })

    console.log(`📊 Found ${categories.length} categories to process`)

    // Update each category with proper order
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      const newOrder = i + 1

      if (category.order !== newOrder) {
        await db.category.update({
          where: { id: category.id },
          data: { order: newOrder }
        })
        console.log(`✅ Updated "${category.name}" order: ${category.order} → ${newOrder}`)
      } else {
        console.log(`📌 "${category.name}" already has correct order: ${newOrder}`)
      }
    }

    console.log('🎉 Category order fixing completed!')
  } catch (error) {
    console.error('❌ Error fixing category order:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  fixCategoryOrder()
}

export default fixCategoryOrder