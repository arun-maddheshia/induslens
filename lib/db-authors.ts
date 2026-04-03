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
        orderBy: { updatedAt: 'desc' },
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

  try {
    return await db.author.create({
      data: {
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

  const { images, ...authorData } = data

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