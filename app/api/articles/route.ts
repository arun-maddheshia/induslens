import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllArticles, createArticle } from "@/lib/db"
import { ArticleStatus, ContentType } from "@prisma/client"

// GET /api/articles - List articles with pagination and filters
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
    const status = searchParams.get("status") || undefined
    const category = searchParams.get("category") || undefined
    const search = searchParams.get("search") || undefined

    const result = await getAllArticles(page, limit, {
      status,
      category,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching articles:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create new article
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
    const requiredFields = ["headline", "excerpt", "articleBody", "metaTitle", "metaDescription", "slug", "category"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Set defaults
    const articleData = {
      ...data,
      status: data.status || ArticleStatus.DRAFT,
      contentType: data.contentType || ContentType.ARTICLES,
      language: data.language || "en",
      visibility: data.visibility ?? true,
      tags: data.tags || [],
      keywords: data.keywords || [],
      genre: data.genre || [],
      subCategories: data.subCategories || [],
      publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
    }

    const article = await createArticle(articleData, session.user.id!)

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error("Error creating article:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}