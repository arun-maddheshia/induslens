import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// PATCH /api/videos/order - Update video orders
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!Array.isArray(data.updates)) {
      return NextResponse.json({ error: "Updates must be an array" }, { status: 400 })
    }

    for (const update of data.updates) {
      if (!update.id || typeof update.order !== "number") {
        return NextResponse.json(
          { error: "Each update must have 'id' (string) and 'order' (number)" },
          { status: 400 }
        )
      }
    }

    // Normalise to sequential 1-based order before persisting
    const sorted = [...data.updates].sort((a, b) => a.order - b.order)
    const normalised = sorted.map((u, i) => ({ id: u.id, order: i + 1 }))

    await db.$transaction(
      normalised.map(({ id, order }) =>
        db.video.update({ where: { id }, data: { order } })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating video orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
