export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hydratePostImages } from "@/lib/image-storage"

// GET /api/industv-videos
// Public endpoint — returns published IndusTv videos (category = 'industv')
// shaped identically to VideoArticle so the UI needs no changes.
export async function GET() {
  try {
    const videos = await db.video.findMany({
      where: {
        status: "Published",
        category: "industv",
      },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      include: { images: true },
    })

    const shaped = videos.map((v) => ({
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
      contentType: v.contentType,
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
      sourceType: v.sourceType,
      status: v.status,
      streamingSource: v.streamingSource || "",
      supplier: [],
      synopsis: v.synopsis,
      tags: v.tags,
      translatedTitle: v.name,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      publishedAt: v.publishedAt ? v.publishedAt.toISOString() : null,
      isContent: v.isContent,
      key: v.key ?? v.order,
      images: hydratePostImages(
        v.images.map((img) => ({
          imageCategory: img.imageCategory,
          imageCategoryValue: img.imageCategoryValue || "",
          imageDescription: img.imageDescription || "",
          imageUrl: img.imageUrl,
          key: img.key || "",
        })),
        "videos"
      ),
    }))

    return NextResponse.json(shaped)
  } catch (error) {
    console.error("Error fetching industv videos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
