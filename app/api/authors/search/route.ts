import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchAuthorsByName } from "@/lib/db-authors"

// GET /api/authors/search?q=name&limit=10
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50)

    if (!q) {
      return NextResponse.json([])
    }

    const authors = await searchAuthorsByName(q, limit)

    return NextResponse.json(authors)
  } catch (error) {
    console.error("Error searching authors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
