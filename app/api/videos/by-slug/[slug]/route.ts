import { NextRequest, NextResponse } from "next/server"
import { getVideoArticleBySlug } from "@/lib/db-videos"

// GET /api/videos/by-slug/[slug]
// Public endpoint — returns a single video shaped as VideoArticle.
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const video = await getVideoArticleBySlug(params.slug)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video by slug:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
