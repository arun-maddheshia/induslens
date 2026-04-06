import { db } from "@/lib/db"

// ─── Public mapper (DB → frontend Eminence type) ──────────────────────────────

type DbEminence = Awaited<ReturnType<typeof db.eminence.findUniqueOrThrow>> & {
  images: Array<{
    imageCategory: string
    imageCategoryValue: string | null
    imageDescription: string | null
    imageUrl: string[]
    key: string | null
  }>
}

function toEminenceModel(e: DbEminence): Eminence {
  return {
    _id: e.legacyId || e.id,
    author: "",
    content: "",
    contentType: "content-block",
    countryName: e.countryName || "",
    createdAt: e.createdAt.toISOString(),
    category: e.category || "Indus_Eminence",
    excerpt: e.excerpt,
    facebookUrl: e.facebookUrl || "",
    images: e.images.map((img) => ({
      imageCategory: img.imageCategory,
      imageCategoryValue: img.imageCategoryValue || "",
      imageDescription: img.imageDescription || "",
      imageUrl: img.imageUrl,
      key: img.key || "",
    })),
    instagramUrl: e.instagramUrl || "",
    isContent: e.isContent,
    key: e.legacyKey ?? undefined,
    language: e.language,
    linkedinUrl: e.linkedinUrl || "",
    name: e.name,
    pageContent: e.pageContent || "",
    publishedAt: e.publishedAt?.toISOString() || e.createdAt.toISOString(),
    siteId: e.siteId || "",
    slug: e.slug,
    status: e.status,
    subtitle: "",
    twitterUrl: e.twitterUrl || "",
    updatedAt: e.updatedAt.toISOString(),
    websiteUrl: e.websiteUrl || "",
  }
}

export async function getPublishedEminence(): Promise<Eminence[]> {
  const entries = await db.eminence.findMany({
    where: { status: "Published" },
    include: { images: true },
    orderBy: { order: "asc" },
  })
  return entries.map(toEminenceModel)
}

// ─── CMS types ────────────────────────────────────────────────────────────────

export interface EminenceImageEntry {
  imageCategory: string
  imageCategoryValue: string
  imageDescription: string
  imageUrl: string[]
  key: string
}

export async function getAllEminence(
  page = 1,
  limit = 20,
  filters: { search?: string; status?: string; country?: string } = {}
) {
  const skip = (page - 1) * limit
  const where: Record<string, unknown> = {}

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { excerpt: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ]
  }
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.country) {
    where.countryName = { contains: filters.country, mode: "insensitive" }
  }

  const [total, items] = await Promise.all([
    db.eminence.count({ where }),
    db.eminence.findMany({
      where,
      include: { images: true },
      orderBy: { order: "asc" },
      skip,
      take: limit,
    }),
  ])

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getEminenceById(id: string) {
  return db.eminence.findUnique({
    where: { id },
    include: { images: true },
  })
}

export async function createEminence(data: {
  name: string
  slug: string
  excerpt: string
  pageContent?: string
  countryName?: string
  category?: string
  language?: string
  status?: string
  isContent?: boolean
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  websiteUrl?: string
  order?: number
  publishedAt?: Date
  images: EminenceImageEntry[]
}) {
  const { images, ...rest } = data
  return db.eminence.create({
    data: {
      ...rest,
      publishedAt: rest.publishedAt ?? new Date(),
      images: {
        create: images.map((img) => ({
          imageCategory: img.imageCategory,
          imageCategoryValue: img.imageCategoryValue,
          imageDescription: img.imageDescription,
          imageUrl: img.imageUrl,
          key: img.key,
        })),
      },
    },
    include: { images: true },
  })
}

export async function updateEminence(
  id: string,
  data: {
    name?: string
    slug?: string
    excerpt?: string
    pageContent?: string
    countryName?: string
    category?: string
    language?: string
    status?: string
    isContent?: boolean
    facebookUrl?: string
    instagramUrl?: string
    twitterUrl?: string
    linkedinUrl?: string
    websiteUrl?: string
    order?: number
    publishedAt?: Date
    images?: EminenceImageEntry[]
  }
) {
  const { images, ...rest } = data
  if (images !== undefined) {
    await db.eminenceImage.deleteMany({ where: { eminenceId: id } })
  }
  return db.eminence.update({
    where: { id },
    data: {
      ...rest,
      ...(images !== undefined && {
        images: {
          create: images.map((img) => ({
            imageCategory: img.imageCategory,
            imageCategoryValue: img.imageCategoryValue,
            imageDescription: img.imageDescription,
            imageUrl: img.imageUrl,
            key: img.key,
          })),
        },
      }),
    },
    include: { images: true },
  })
}

export async function deleteEminence(id: string) {
  return db.eminence.delete({ where: { id } })
}
