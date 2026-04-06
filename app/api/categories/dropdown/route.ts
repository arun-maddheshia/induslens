import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCategoriesForDropdown } from "@/lib/db-categories"

// GET /api/categories/dropdown - Get categories for dropdown selection
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const categories = await getCategoriesForDropdown()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories for dropdown:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}