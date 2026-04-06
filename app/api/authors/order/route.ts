import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllAuthorsForOrdering, updateAuthorOrders } from "@/lib/db-authors"

// GET /api/authors/order - Get all authors for reordering
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const authors = await getAllAuthorsForOrdering()

    return NextResponse.json({ authors })
  } catch (error) {
    console.error("Error fetching authors for ordering:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/authors/order - Update author orders
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validate the updates array
    if (!Array.isArray(data.updates)) {
      return NextResponse.json(
        { error: "Updates must be an array" },
        { status: 400 }
      )
    }

    // Validate each update object
    for (const update of data.updates) {
      if (!update.id || typeof update.order !== 'number') {
        return NextResponse.json(
          { error: "Each update must have 'id' (string) and 'order' (number)" },
          { status: 400 }
        )
      }
    }

    await updateAuthorOrders(data.updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating author orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}