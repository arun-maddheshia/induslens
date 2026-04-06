import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlaylist, addArticleToPlaylist, PlaylistType } from "@/lib/db-playlists"

// GET /api/playlists/[type] - Get playlist items
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const type = params.type as PlaylistType

    if (!['hero', 'other-stories'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid playlist type" },
        { status: 400 }
      )
    }

    const playlist = await getPlaylist(type)

    return NextResponse.json({
      type,
      items: playlist
    })
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/playlists/[type] - Add article to playlist
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const type = params.type as PlaylistType

    if (!['hero', 'other-stories'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid playlist type" },
        { status: 400 }
      )
    }

    const { articleId } = await request.json()

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      )
    }

    const playlistItem = await addArticleToPlaylist(type, articleId)

    return NextResponse.json(playlistItem, { status: 201 })
  } catch (error) {
    console.error("Error adding article to playlist:", error)

    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}