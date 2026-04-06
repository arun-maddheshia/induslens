import { NextResponse } from "next/server"
import { getPublishedEminence } from "@/lib/db-eminence"

export async function GET() {
  try {
    const entries = await getPublishedEminence()
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching public eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
