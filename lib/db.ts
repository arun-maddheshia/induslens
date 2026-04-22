import { PrismaClient } from "@prisma/client"

// Prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined
}

const prismaInstance: PrismaClient = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

export const db = prismaInstance

if (process.env.NODE_ENV !== "production") {
  global.prisma = db
}


export async function createUser(email: string, password: string, name?: string) {
  return await db.user.create({
    data: {
      email,
      password, 
      name,
    },
  })
}

export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
  })
}

export async function getAllArticles(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string
    category?: string
    categoryId?: string
    unassignedToCategory?: string
    search?: string
    siteId?: string
    authorId?: string
  }
) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters?.siteId) {
    where.siteId = filters.siteId
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.authorId) {
    where.authorId = filters.authorId
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters?.category) {
    where.category = filters.category
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters?.unassignedToCategory) {
    where.OR = [
      { categoryId: null },
      { categoryId: { not: filters.unassignedToCategory } }
    ]
  }

  if (filters?.search) {
    const searchConditions = [
      { headline: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
    ]

    if (where.OR) {
      // Combine with existing OR conditions
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions }
      ]
      delete where.OR
    } else {
      where.OR = searchConditions
    }
  }

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        editor: {
          select: { id: true, name: true, email: true }
        },
        images: true,
      },
    }),
    db.article.count({ where }),
  ])

  return {
    articles,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getArticleById(id: string) {
  return await db.article.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      editor: {
        select: { id: true, name: true, email: true }
      },
      images: true,
    },
  })
}

export async function getArticleBySlug(slug: string) {
  return await db.article.findFirst({
    where: { slug, status: "PUBLISHED", visibility: true },
    include: {
      author: {
        include: { images: true },
      },
      images: true,
      categoryRef: { select: { id: true, name: true, slug: true, isNews: true } },
    },
  })
}

async function uniqueSlug(base: string): Promise<string> {
  const exists = await db.article.findUnique({ where: { slug: base }, select: { id: true } })
  if (!exists) return base
  let n = 2
  while (true) {
    const candidate = `${base}-${n}`
    const taken = await db.article.findUnique({ where: { slug: candidate }, select: { id: true } })
    if (!taken) return candidate
    n++
  }
}

export async function createArticle(data: any, editorId?: string) {
  const { images, ...articleData } = data
  articleData.slug = await uniqueSlug(articleData.slug)

  return await db.article.create({
    data: {
      ...articleData,
      authorId: articleData.authorId || null,
      editorId: editorId || null,
      images: images ? {
        create: images.map((img: any) => ({
          imageCategory: img.imageCategory,
          imageCategoryValue: img.imageCategoryValue,
          imageDescription: img.imageDescription,
          imageUrl: img.imageUrl,
        }))
      } : undefined,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      images: true,
    },
  })
}

export async function updateArticle(id: string, data: any, editorId?: string) {
  const { images, author, editor, ...articleData } = data

  return await db.article.update({
    where: { id },
    data: {
      ...articleData,
      authorId: articleData.authorId !== undefined ? (articleData.authorId || null) : undefined,
      editorId,
      images: images ? {
        deleteMany: {},
        create: images.map((img: any) => ({
          imageCategory: img.imageCategory,
          imageCategoryValue: img.imageCategoryValue,
          imageDescription: img.imageDescription,
          imageUrl: img.imageUrl,
        }))
      } : undefined,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      editor: {
        select: { id: true, name: true, email: true }
      },
      images: true,
    },
  })
}

export async function deleteArticle(id: string) {
  return await db.article.delete({
    where: { id },
  })
}

export async function getCategories() {
  const categories = await db.article.groupBy({
    by: ['category'],
    _count: true,
  })

  return categories.map((cat: { category: string | null; _count: any }) => ({
    category: cat.category || "Uncategorized",
    count: cat._count,
  }))
}