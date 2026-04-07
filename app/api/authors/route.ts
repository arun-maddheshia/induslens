import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllAuthors, createAuthor } from "@/lib/db-authors"
import { normalizeImagesForStorage } from "@/lib/image-storage"

// GET /api/authors - List authors with pagination and filters
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

    const result = await getAllAuthors(page, limit, { search })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching authors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/authors - Create new author
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
    const requiredFields = ["name", "slug"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Set defaults
    const authorData = {
      ...data,
      images: Array.isArray(data.images)
        ? normalizeImagesForStorage(data.images)
        : data.images,
      status: data.status || "Published",
      contentType: data.contentType || "anchor",
      isContent: data.isContent ?? true,
      shows: data.shows || [],
    }

    const author = await createAuthor(authorData)

    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    console.error("Error creating author:", error)

    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "Author with this slug or key already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}