import { PrismaClient } from "@prisma/client"

// Prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined
}

export const db = global.prisma ?? new PrismaClient()

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
    search?: string
  }
) {
  const skip = (page - 1) * limit

  const where: any = {}

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.category) {
    where.category = filters.category
  }

  if (filters?.search) {
    where.OR = [
      { headline: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
    ]
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

export async function createArticle(data: any, authorId: string) {
  const { images, ...articleData } = data

  return await db.article.create({
    data: {
      ...articleData,
      authorId,
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
  const { images, ...articleData } = data

  return await db.article.update({
    where: { id },
    data: {
      ...articleData,
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

  return categories.map((cat: { category: string; _count: any }) => ({
    category: cat.category,
    count: cat._count,
  }))
}