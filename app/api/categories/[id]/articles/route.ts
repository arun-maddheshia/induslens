import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCategoryArticles, updateArticleOrdersInCategory } from "@/lib/db-categories"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/categories/[id]/articles - Get articles for a category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "50") // Higher limit for admin

    const result = await getCategoryArticles(params.id, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching category articles:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/categories/[id]/articles - Update article orders within category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      if (!update.id || typeof update.categoryOrder !== 'number') {
        return NextResponse.json(
          { error: "Each update must have 'id' (string) and 'categoryOrder' (number)" },
          { status: 400 }
        )
      }
    }

    await updateArticleOrdersInCategory(params.id, data.updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating article orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}