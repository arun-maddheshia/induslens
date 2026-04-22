import { db } from "./db"

// Get all categories with pagination and filters
export async function getAllCategories(
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string
    isNews?: boolean
    siteId?: string
  } = {}
) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  const skip = (page - 1) * limit

  const where: any = {}

  // Add search filter
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  // Add isNews filter
  if (typeof filters.isNews === 'boolean') {
    where.isNews = filters.isNews
  }

  // Add siteId filter
  if (filters.siteId) {
    where.siteId = filters.siteId
  }

  try {
    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }
        ],
        include: {
          _count: {
            select: { articles: true }
          }
        }
      }),
      db.category.count({ where })
    ])

    return {
      categories: categories || [],
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit)
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return {
      categories: [],
      total: 0,
      page,
      totalPages: 0
    }
  }
}

// Get single category by ID
export async function getCategoryById(id: string) {
  if (!db || !id) {
    return null
  }

  try {
    return await db.category.findUnique({
      where: { id },
      include: {
        articles: {
          select: {
            id: true,
            headline: true,
            status: true,
            publishedAt: true
          },
          orderBy: { updatedAt: 'desc' },
          take: 10 // Show latest 10 articles
        },
        _count: {
          select: { articles: true }
        }
      }
    })
  } catch (error) {
    console.error("Error fetching category by ID:", error)
    return null
  }
}

// Create new category
export async function createCategory(data: {
  id: string
  slug: string
  name: string
  description: string
  isNews?: boolean
  order?: number
}) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  try {
    // Generate a unique ID and slug if not provided
    const categoryData = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      isNews: data.isNews ?? false,
      order: data.order ?? 1,
    }

    return await db.category.create({
      data: categoryData,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

// Update category
export async function updateCategory(id: string, data: {
  name?: string
  slug?: string
  description?: string
  isNews?: boolean
  order?: number
}) {
  if (!db || !id) {
    throw new Error("Database connection or ID not available")
  }

  try {
    return await db.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

// Delete category
export async function deleteCategory(id: string) {
  if (!db || !id) {
    throw new Error("Database connection or ID not available")
  }

  try {
    // First check if category has any articles
    const categoryWithArticles = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!categoryWithArticles) {
      throw new Error("Category not found")
    }

    if (categoryWithArticles._count.articles > 0) {
      throw new Error(`Cannot delete category: ${categoryWithArticles._count.articles} article(s) still assigned to this category`)
    }

    return await db.category.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// Get categories for dropdown (simplified data)
export async function getCategoriesForDropdown() {
  if (!db) {
    return []
  }

  try {
    return await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isNews: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
  } catch (error) {
    console.error("Error fetching categories for dropdown:", error)
    return []
  }
}

// Generate slug from name
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Bulk update category orders
export async function updateCategoryOrders(updates: { id: string; order: number }[]) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  try {
    // Use a transaction to update all orders atomically
    return await db.$transaction(
      updates.map(({ id, order }) =>
        db.category.update({
          where: { id },
          data: { order }
        })
      )
    )
  } catch (error) {
    console.error("Error updating category orders:", error)
    throw error
  }
}

// Get articles for a category with ordering
export async function getCategoryArticles(
  categoryId: string,
  page: number = 1,
  limit: number = 10
) {
  if (!db || !categoryId) {
    return {
      articles: [],
      total: 0,
      page,
      totalPages: 0
    }
  }

  const skip = (page - 1) * limit

  try {
    const [articles, total] = await Promise.all([
      db.article.findMany({
        where: { categoryId },
        skip,
        take: limit,
        orderBy: [
          { categoryOrder: 'asc' },
          { publishedAt: 'desc' }
        ],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          legacyAuthor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      db.article.count({ where: { categoryId } })
    ])

    return {
      articles: articles || [],
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit)
    }
  } catch (error) {
    console.error("Error fetching category articles:", error)
    return {
      articles: [],
      total: 0,
      page,
      totalPages: 0
    }
  }
}

// Bulk update article orders within a category
export async function updateArticleOrdersInCategory(
  categoryId: string,
  updates: { id: string; categoryOrder: number }[]
) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  try {
    // Use a transaction to update all orders atomically
    return await db.$transaction(
      updates.map(({ id, categoryOrder }) =>
        db.article.update({
          where: {
            id,
            categoryId // Ensure article belongs to the category
          },
          data: { categoryOrder }
        })
      )
    )
  } catch (error) {
    console.error("Error updating article orders in category:", error)
    throw error
  }
}

// Generate ID from name (replace spaces with underscores, maintain original case for readability)
export function generateCategoryId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_]/g, '') // Remove special characters except spaces and underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .trim()
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
}