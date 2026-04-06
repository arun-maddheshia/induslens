import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEminenceById, updateEminence, deleteEminence } from "@/lib/db-eminence"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const eminence = await getEminenceById(id)
    if (!eminence) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(eminence)
  } catch (error) {
    console.error("Error fetching eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const data = await request.json()
    const eminence = await updateEminence(id, {
      name: data.name,
      slug: data.slug,
      excerpt: data.excerpt,
      pageContent: data.pageContent ?? undefined,
      countryName: data.countryName ?? undefined,
      category: data.category ?? undefined,
      language: data.language ?? undefined,
      status: data.status ?? undefined,
      isContent: data.isContent ?? undefined,
      facebookUrl: data.facebookUrl ?? undefined,
      instagramUrl: data.instagramUrl ?? undefined,
      twitterUrl: data.twitterUrl ?? undefined,
      linkedinUrl: data.linkedinUrl ?? undefined,
      websiteUrl: data.websiteUrl ?? undefined,
      order: data.order ?? undefined,
      images: data.images !== undefined ? data.images : undefined,
    })
    return NextResponse.json(eminence)
  } catch (error) {
    console.error("Error updating eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    await deleteEminence(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting eminence:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
