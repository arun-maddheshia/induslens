import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllEminence, createEminence } from "@/lib/db-eminence"
import { normalizeImagesForStorage } from "@/lib/image-storage"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || undefined
    const status = searchParams.get("status") || undefined
    const country = searchParams.get("country") || undefined

    const result = await getAllEminence(page, limit, { search, status, country })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const eminence = await createEminence({
      name: data.name,
      slug: data.slug,
      excerpt: data.excerpt,
      pageContent: data.pageContent || null,
      countryName: data.countryName || null,
      category: data.category || "Indus_Eminence",
      language: data.language || "en",
      status: data.status || "Published",
      isContent: data.isContent ?? true,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      twitterUrl: data.twitterUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      websiteUrl: data.websiteUrl || null,
      order: data.order || 1,
      images: normalizeImagesForStorage(data.images || []),
    })
    return NextResponse.json(eminence, { status: 201 })
  } catch (error) {
    console.error("Error creating eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
