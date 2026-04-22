import { hydratePostImages } from "./image-storage"

export function mapAuthorToFrontend(
  author: {
    id: string
    name: string
    aboutTheAnchor: string
    slug: string
    email?: string | null
    twitterUrl?: string | null
    facebookUrl?: string | null
    instagramUrl?: string | null
    linkedinUrl?: string | null
    youtubeUrl?: string | null
    websiteUrl?: string | null
    authorUrl?: string | null
    contentType: string
    countryName?: string | null
    status: string
    isContent: boolean
    key?: number | null
    siteId?: string | null
    description?: string | null
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
    images: Array<{
      imageCategory: string
      imageCategoryValue: string | null
      imageDescription: string | null
      imageUrl: string[]
      key?: string | null
    }>
  }
): Author {
  return {
    _id: author.id,
    name: author.name,
    aboutTheAnchor: author.aboutTheAnchor,
    anchorKey: "",
    email: author.email || "",
    contentType: author.contentType as any,
    images: hydratePostImages(
      author.images.map((img) => ({
        imageCategory: img.imageCategory,
        imageCategoryValue: img.imageCategoryValue || "",
        imageDescription: img.imageDescription || "",
        imageUrl: img.imageUrl,
        key: img.key || "",
      })),
      "authors"
    ),
    facebookUrl: author.facebookUrl || "",
    linkedinUrl: author.linkedinUrl || "",
    twitterUrl: author.twitterUrl || "",
    instagramUrl: author.instagramUrl || "",
    youtubeUrl: author.youtubeUrl || "",
    websiteUrl: author.websiteUrl || "",
    authorUrl: author.authorUrl || "",
    shows: [],
    siteId: author.siteId || "",
    countryName: author.countryName || "",
    createdAt: author.createdAt.toISOString(),
    description: author.description || "",
    status: author.status,
    key: author.key ?? 0,
    slug: author.slug,
    publishedAt: author.publishedAt?.toISOString() || "",
    updatedAt: author.updatedAt.toISOString(),
    isContent: author.isContent,
  }
}
