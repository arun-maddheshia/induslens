import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { removeArticleFromPlaylist, PlaylistType } from "@/lib/db-playlists"

// DELETE /api/playlists/[type]/[id] - Remove article from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
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
    const playlistId = params.id

    if (!['hero', 'other-stories', 'industales'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid playlist type" },
        { status: 400 }
      )
    }

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist item ID is required" },
        { status: 400 }
      )
    }

    await removeArticleFromPlaylist(type, playlistId)

    return NextResponse.json(
      { message: "Article removed from playlist successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing article from playlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}