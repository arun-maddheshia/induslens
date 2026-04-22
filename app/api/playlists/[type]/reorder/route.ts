import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updatePlaylistOrder, PlaylistType } from "@/lib/db-playlists"

// PUT /api/playlists/[type]/reorder - Update playlist order
export async function PUT(
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

    if (!['hero', 'other-stories', 'industales'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid playlist type" },
        { status: 400 }
      )
    }

    const { items } = await request.json()

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 }
      )
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id) {
        return NextResponse.json(
          { error: "Each item must have an id" },
          { status: 400 }
        )
      }
    }

    await updatePlaylistOrder(type, items)

    return NextResponse.json({
      message: `${type} playlist order updated successfully`,
      itemCount: items.length
    })
  } catch (error) {
    console.error("Error updating playlist order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}