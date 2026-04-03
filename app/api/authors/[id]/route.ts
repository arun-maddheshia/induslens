import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAuthorById, updateAuthor, deleteAuthor } from "@/lib/db-authors"

// GET /api/authors/[id] - Get single author
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const author = await getAuthorById(params.id)

    if (!author) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error("Error fetching author:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/authors/[id] - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Check if author exists
    const existingAuthor = await getAuthorById(params.id)
    if (!existingAuthor) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      )
    }

    const author = await updateAuthor(params.id, data)

    return NextResponse.json(author)
  } catch (error) {
    console.error("Error updating author:", error)

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

// DELETE /api/authors/[id] - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if author exists
    const existingAuthor = await getAuthorById(params.id)
    if (!existingAuthor) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      )
    }

    // Check if author has articles
    // Note: This will be handled by the database constraint or we can add a check here

    await deleteAuthor(params.id)

    return NextResponse.json(
      { message: "Author deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting author:", error)

    // Handle foreign key constraint errors
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: "Cannot delete author with associated articles" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}