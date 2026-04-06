import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCategoryById, updateCategory, deleteCategory, generateCategorySlug } from "@/lib/db-categories"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const category = await getCategoryById(params.id)

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validate that category exists
    const existingCategory = await getCategoryById(params.id)
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (data.name !== undefined) {
      updateData.name = data.name
      // Auto-generate slug if name changes but slug is not provided
      if (data.slug === undefined) {
        updateData.slug = generateCategorySlug(data.name)
      }
    }

    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.isNews !== undefined) updateData.isNews = data.isNews
    if (data.order !== undefined) updateData.order = data.order

    const category = await updateCategory(params.id, updateData)

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)

    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await deleteCategory(params.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        )
      }

      if (error.message.includes("Cannot delete category")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}