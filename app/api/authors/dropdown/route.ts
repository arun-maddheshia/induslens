import { NextRequest, NextResponse } from "next/server"
import { getAuthorsForDropdown } from "@/lib/db-authors"

// GET /api/authors/dropdown - Get authors for dropdown
export async function GET(request: NextRequest) {
  try {
    const authors = await getAuthorsForDropdown()
    return NextResponse.json(authors)
  } catch (error) {
    console.error("Error fetching authors for dropdown:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}