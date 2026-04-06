import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getVideoById, updateVideo, deleteVideo } from "@/lib/db-videos"

// GET /api/videos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const video = await getVideoById(params.id)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/videos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await getVideoById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const data = await request.json()
    const video = await updateVideo(params.id, data)

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error updating video:", error)

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A video with this slug already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/videos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await getVideoById(params.id)
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    await deleteVideo(params.id)

    return NextResponse.json({ message: "Video deleted successfully" })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
