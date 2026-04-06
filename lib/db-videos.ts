import { db } from "./db"

export async function getAllVideos(
  page: number = 1,
  limit: number = 10,
  filters: { search?: string; status?: string; category?: string } = {}
) {
  const skip = (page - 1) * limit
  const where: any = {}

  if (filters.status) where.status = filters.status
  if (filters.category) where.category = filters.category
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { synopsis: { contains: filters.search, mode: "insensitive" } },
      { metaTitle: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  const [videos, total] = await Promise.all([
    db.video.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
      include: { images: true },
    }),
    db.video.count({ where }),
  ])

  return {
    videos: videos || [],
    total: total || 0,
    page,
    totalPages: Math.ceil((total || 0) / limit),
  }
}

export async function getVideoById(id: string) {
  if (!id) return null
  return await db.video.findUnique({ where: { id }, include: { images: true } })
}

export async function getVideoBySlug(slug: string) {
  if (!slug) return null
  return await db.video.findUnique({ where: { slug }, include: { images: true } })
}

export async function createVideo(data: any) {
  const { images, ...videoData } = data

  return await db.video.create({
    data: {
      ...videoData,
      images:
        images && Array.isArray(images) && images.length > 0
          ? {
              create: images.map((img: any) => ({
                imageCategory: img.imageCategory || "",
                imageCategoryValue: img.imageCategoryValue || null,
                imageDescription: img.imageDescription || null,
                imageUrl: Array.isArray(img.imageUrl) ? img.imageUrl : [],
                key: img.key || null,
              })),
            }
          : undefined,
    },
    include: { images: true },
  })
}

export async function updateVideo(id: string, data: any) {
  if (!id) throw new Error("ID not provided")

  const { images, ...videoData } = data

  return await db.video.update({
    where: { id },
    data: {
      ...videoData,
      images:
        images !== undefined
          ? {
              deleteMany: {},
              create: images.map((img: any) => ({
                imageCategory: img.imageCategory || "",
                imageCategoryValue: img.imageCategoryValue || null,
                imageDescription: img.imageDescription || null,
                imageUrl: Array.isArray(img.imageUrl) ? img.imageUrl : [],
                key: img.key || null,
              })),
            }
          : undefined,
    },
    include: { images: true },
  })
}

export async function deleteVideo(id: string) {
  if (!id) throw new Error("ID not provided")
  return await db.video.delete({ where: { id } })
}

// ─── Shared mapper: Prisma Video → VideoArticle ──────────────────────────────

type DbVideo = Awaited<ReturnType<typeof db.video.findUniqueOrThrow>> & {
  images: Array<{
    imageCategory: string
    imageCategoryValue: string | null
    imageDescription: string | null
    imageUrl: string[]
    key: string | null
  }>
}

function toVideoArticle(v: DbVideo): VideoArticle {
  return {
    _id: v.legacyId || v.id,
    ChannelName: v.channelName || "",
    acquisitionDepartment: "",
    ageGroup: [],
    author: v.author || "",
    cast: [],
    category: v.category || "",
    channelId: v.channelId || "",
    contentId: v.contentId,
    contentKey: "",
    contentType: v.contentType as VideoArticle["contentType"],
    duration: v.duration || "",
    genre: v.genre,
    language: v.language,
    languageCode: v.languageCode || v.language,
    metaDescription: v.metaDescription,
    metaTitle: v.metaTitle,
    name: v.name,
    notes: "",
    originalLanguage: [],
    productionCountry: [],
    productionHouse: "",
    productionYear: "",
    rights: [],
    siteId: v.siteId || "",
    slug: v.slug,
    sourceType: v.sourceType as VideoArticle["sourceType"],
    status: v.status,
    streamingSource: v.streamingSource || "",
    supplier: [],
    synopsis: v.synopsis,
    tags: v.tags,
    translatedTitle: v.name,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    publishedAt: v.publishedAt ? v.publishedAt.toISOString() : undefined,
    isContent: v.isContent,
    key: v.key ?? v.order,
    images: v.images.map((img) => ({
      imageCategory: img.imageCategory,
      imageCategoryValue: img.imageCategoryValue || "",
      imageDescription: img.imageDescription || "",
      imageUrl: img.imageUrl,
      key: img.key || "",
    })),
  }
}

// ─── Public query functions returning VideoArticle shape ──────────────────────

export async function getVideoArticleBySlug(slug: string): Promise<VideoArticle | null> {
  if (!slug) return null
  const v = await db.video.findUnique({ where: { slug }, include: { images: true } })
  if (!v) return null
  return toVideoArticle(v)
}

export async function getTrendingVideos(): Promise<VideoArticle[]> {
  const videos = await db.video.findMany({
    where: {
      status: "Published",
      OR: [{ category: null }, { category: "" }],
    },
    orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
    include: { images: true },
  })
  return videos.map(toVideoArticle)
}
