#!/usr/bin/env tsx

import { db } from '../lib/db'

async function addCategoryOrderField() {
  try {
    console.log('🔄 Adding categoryOrder field to articles and setting initial values...')

    // Get all categories
    const categories = await db.category.findMany({
      include: {
        articles: {
          orderBy: {
            publishedAt: 'desc' // Default order by publication date
          }
        }
      }
    })

    for (const category of categories) {
      console.log(`📂 Processing category: ${category.name} (${category.articles.length} articles)`)

      // Update each article with its order within the category
      for (let i = 0; i < category.articles.length; i++) {
        await db.article.update({
          where: { id: category.articles[i].id },
          data: { categoryOrder: i + 1 }
        })
      }
    }

    // Handle articles without category
    const articlesWithoutCategory = await db.article.findMany({
      where: { categoryId: null },
      orderBy: { publishedAt: 'desc' }
    })

    if (articlesWithoutCategory.length > 0) {
      console.log(`📄 Processing ${articlesWithoutCategory.length} articles without category`)

      for (let i = 0; i < articlesWithoutCategory.length; i++) {
        await db.article.update({
          where: { id: articlesWithoutCategory[i].id },
          data: { categoryOrder: i + 1 }
        })
      }
    }

    console.log('✅ Successfully added categoryOrder field and set initial values!')
  } catch (error) {
    console.error('❌ Error adding categoryOrder field:', error)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  addCategoryOrderField()
}

export default addCategoryOrderField