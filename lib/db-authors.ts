import { db } from "./db"

// Get all authors with pagination and filters
export async function getAllAuthors(
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string
    status?: string
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
      { aboutTheAnchor: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  // Add status filter
  if (filters.status) {
    where.status = filters.status
  }

  try {
    const [authors, total] = await Promise.all([
      db.author.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { updatedAt: 'desc' }
        ],
        include: {
          images: true,
          _count: {
            select: { articles: true }
          }
        }
      }),
      db.author.count({ where })
    ])

    return {
      authors: authors || [],
      total: total || 0,
      page,
      totalPages: Math.ceil((total || 0) / limit)
    }
  } catch (error) {
    console.error("Error fetching authors:", error)
    return {
      authors: [],
      total: 0,
      page,
      totalPages: 0
    }
  }

}

// Get single author by ID
export async function getAuthorById(id: string) {
  if (!db || !id) {
    return null
  }

  try {
    return await db.author.findUnique({
      where: { id },
      include: {
        images: true,
        articles: {
          select: {
            id: true,
            headline: true,
            status: true,
            publishedAt: true
          },
          orderBy: { updatedAt: 'desc' },
          take: 5 // Show latest 5 articles
        }
      }
    })
  } catch (error) {
    console.error("Error fetching author by ID:", error)
    return null
  }
}

// Create new author
export async function createAuthor(data: any) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  const { images, ...authorData } = data

  // Generate a unique ID for new authors using crypto
  const crypto = require('crypto')
  const authorId = crypto.randomBytes(16).toString('hex')

  try {
    return await db.author.create({
      data: {
        id: authorId, // Provide the generated ID
        ...authorData,
        images: images && Array.isArray(images) ? {
          create: images.map((img: any) => ({
            imageCategory: img.imageCategory || "",
            imageCategoryValue: img.imageCategoryValue || null,
            imageDescription: img.imageDescription || null,
            imageUrl: Array.isArray(img.imageUrl) ? img.imageUrl : [],
            key: img.key || null,
          }))
        } : undefined,
      },
      include: {
        images: true
      }
    })
  } catch (error) {
    console.error("Error creating author:", error)
    throw error
  }
}

// Update author
export async function updateAuthor(id: string, data: any) {
  if (!db || !id) {
    throw new Error("Database connection or ID not available")
  }

  // Exclude relational and computed fields that shouldn't be directly updated
  const {
    images,
    articles,
    _count,
    createdAt,
    updatedAt,
    ...authorData
  } = data

  try {
    return await db.author.update({
      where: { id },
      data: {
        ...authorData,
        images: images && Array.isArray(images) ? {
          deleteMany: {},
          create: images.map((img: any) => ({
            imageCategory: img.imageCategory || "",
            imageCategoryValue: img.imageCategoryValue || null,
            imageDescription: img.imageDescription || null,
            imageUrl: Array.isArray(img.imageUrl) ? img.imageUrl : [],
            key: img.key || null,
          }))
        } : undefined,
      },
      include: {
        images: true
      }
    })
  } catch (error) {
    console.error("Error updating author:", error)
    throw error
  }
}

// Delete author
export async function deleteAuthor(id: string) {
  if (!db || !id) {
    throw new Error("Database connection or ID not available")
  }

  try {
    return await db.author.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Error deleting author:", error)
    throw error
  }
}

// Search authors by name (lightweight, for filter suggestions)
export async function searchAuthorsByName(query: string, limit: number = 10) {
  if (!db) return []

  try {
    return await db.author.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: limit,
    })
  } catch (error) {
    console.error("Error searching authors by name:", error)
    return []
  }
}

// Get authors for dropdown (simplified data)
export async function getAuthorsForDropdown() {
  if (!db) {
    return []
  }

  try {
    return await db.author.findMany({
      where: {
        status: 'Published',
        isContent: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching authors for dropdown:", error)
    return []
  }
}

// Get all authors for ordering (no pagination)
export async function getAllAuthorsForOrdering() {
  if (!db) {
    return []
  }

  try {
    const authors = await db.author.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        images: true,
        _count: {
          select: { articles: true }
        }
      }
    })

    const orderValues = authors.map((a) => a.order)
    const hasDuplicates = new Set(orderValues).size !== orderValues.length

    if (hasDuplicates) {
      await db.$transaction(
        authors.map((author, index) =>
          db.author.update({
            where: { id: author.id },
            data: { order: index + 1 }
          })
        )
      )
      return authors.map((author, index) => ({ ...author, order: index + 1 }))
    }

    return authors
  } catch (error) {
    console.error("Error fetching authors for ordering:", error)
    return []
  }
}

// Bulk update author orders

export async function updateAuthorOrders(updates: { id: string; order: number }[]) {
  if (!db) {
    throw new Error("Database connection not available")
  }

  try {

    const sorted = [...updates].sort((a, b) => a.order - b.order)
    const normalized = sorted.map((item, index) => ({ id: item.id, order: index + 1 }))

    return await db.$transaction(
      normalized.map(({ id, order }) =>
        db.author.update({
          where: { id },
          data: { order }
        })
      )
    )
  } catch (error) {
    console.error("Error updating author orders:", error)
    throw error
  }
}