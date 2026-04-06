import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db"
import { ArticleStatus } from "@prisma/client"

// GET /api/articles/[id] - Get single article
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

    const article = await getArticleById(params.id)

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error fetching article:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - Update article
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

    // Check if article exists
    const existingArticle = await getArticleById(params.id)
    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }

    // Handle status changes
    const updateData = { ...data }
    if (data.status === ArticleStatus.PUBLISHED && existingArticle.status !== ArticleStatus.PUBLISHED) {
      updateData.publishedAt = new Date()
    } else if (data.status === ArticleStatus.ARCHIVED) {
      updateData.archivedAt = new Date()
    }

    // Handle categoryId: if category field contains an ID, use it as categoryId
    if (data.category !== undefined) {
      updateData.categoryId = data.category || null
      updateData.category = data.category || null
    }

    const article = await updateArticle(params.id, updateData, session.user.id!)

    return NextResponse.json(article)
  } catch (error) {
    console.error("Error updating article:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - Delete article
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

    // Check if article exists
    const existingArticle = await getArticleById(params.id)
    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }

    await deleteArticle(params.id)

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting article:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}