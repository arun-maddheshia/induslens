import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchArticlesForPlaylist, PlaylistType } from "@/lib/db-playlists"

// GET /api/playlists/search - Search articles for playlist
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || undefined
    const exclude = searchParams.get("exclude") as PlaylistType | undefined

    if (exclude && !['hero', 'other-stories'].includes(exclude)) {
      return NextResponse.json(
        { error: "Invalid exclude playlist type" },
        { status: 400 }
      )
    }

    const articles = await searchArticlesForPlaylist(query, exclude)

    return NextResponse.json({
      articles,
      query,
      exclude,
      total: articles.length
    })
  } catch (error) {
    console.error("Error searching articles for playlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}