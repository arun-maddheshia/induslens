import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllCategories, createCategory, generateCategoryId, generateCategorySlug, updateCategoryOrders } from "@/lib/db-categories"

// GET /api/categories - List categories with pagination and filters
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
    const page = parseInt(searchParams.get("page") ?? "1")
    const limit = parseInt(searchParams.get("limit") ?? "10")
    const search = searchParams.get("search") || undefined
    const isNews = searchParams.get("isNews")

    const filters: any = { search }

    if (isNews !== null && isNews !== undefined) {
      filters.isNews = isNews === 'true'
    }

    const result = await getAllCategories(page, limit, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = ["name"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Generate ID and slug if not provided
    const categoryData = {
      id: data.id || generateCategoryId(data.name),
      slug: data.slug || generateCategorySlug(data.name),
      name: data.name,
      description: data.description || "",
      isNews: data.isNews ?? false,
      order: data.order ?? 1,
    }

    const category = await createCategory(categoryData)

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)

    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "Category with this ID or slug already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/categories - Bulk update category orders
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

    await updateCategoryOrders(data.updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating category orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}