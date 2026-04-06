import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllVideos, createVideo } from "@/lib/db-videos"

// GET /api/videos - List videos with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "10")
    const search = searchParams.get("search") || undefined
    const status = searchParams.get("status") || undefined
    const category = searchParams.get("category") || undefined

    const result = await getAllVideos(page, limit, { search, status, category })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/videos - Create new video
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const requiredFields = ["name", "slug", "contentId"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const videoData = {
      ...data,
      status: data.status || "Published",
      isContent: data.isContent ?? true,
      genre: data.genre || [],
      tags: data.tags || [],
      language: data.language || "en",
      sourceType: data.sourceType || "youtube",
    }

    const video = await createVideo(videoData)

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Error creating video:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A video with this slug already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
