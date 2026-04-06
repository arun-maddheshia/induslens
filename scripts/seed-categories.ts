import { PrismaClient } from "@prisma/client"
import { categories } from "../data/categories"

const db = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function seedCategories() {
  console.log("📂 Seeding categories...")

  for (const cat of categories) {
    await db.category.upsert({
      where: { id: cat.id },
      update: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
      },
    })
    console.log(`  ✅ ${cat.id}`)
  }

  console.log(`\n  📊 ${categories.length} categories seeded\n`)
}

async function backfillArticleCategoryIds() {
  console.log("🔗 Back-filling categoryId on articles...")

  const categoryIds = new Set(categories.map((c) => c.id))

  // Find all articles that have a category value matching a known Category id
  const articles = await db.article.findMany({
    where: {
      category: { in: Array.from(categoryIds) },
      categoryId: null, // only ones not yet linked
    },
    select: { id: true, category: true },
  })

  console.log(`  Found ${articles.length} articles to back-fill`)

  let updated = 0
  for (const article of articles) {
    if (article.category && categoryIds.has(article.category)) {
      await db.article.update({
        where: { id: article.id },
        data: { categoryId: article.category },
      })
      updated++
    }
  }

  console.log(`  ✅ Updated ${updated} articles with categoryId\n`)
}

async function main() {
  try {
    console.log("🔗 Connecting to database...")
    await db.$connect()
    console.log("✅ Connected\n")

    await seedCategories()
    await backfillArticleCategoryIds()

    // Summary
    const totalCategories = await db.category.count()
    const linkedArticles = await db.article.count({ where: { categoryId: { not: null } } })
    const unlinkedArticles = await db.article.count({ where: { categoryId: null } })

    console.log("=".repeat(50))
    console.log("📊 SUMMARY")
    console.log("=".repeat(50))
    console.log(`📂 Total categories: ${totalCategories}`)
    console.log(`🔗 Articles linked to a category: ${linkedArticles}`)
    console.log(`⚪ Articles without a category (e.g. 'none'): ${unlinkedArticles}`)

    console.log("\n🎉 Category seeding complete!")
  } catch (error) {
    console.error("💥 Failed:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
