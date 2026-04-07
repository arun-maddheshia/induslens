import { NextRequest, NextResponse } from "next/server"
import { uploadToS3 } from "@/lib/s3"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// Maps the "type" form field to the S3 folder prefix
const TYPE_TO_PREFIX: Record<string, string> = {
  articles: "images/articles",
  authors: "images/authors",
  videos: "images/videos",
  eminence: "images/eminence",
}

function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split(".").pop()
  return `${timestamp}_${random}.${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "No category specified" }, { status: 400 })
    }

    if (!type || !TYPE_TO_PREFIX[type]) {
      return NextResponse.json(
        { error: `Invalid or missing upload type. Must be one of: ${Object.keys(TYPE_TO_PREFIX).join(", ")}` },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const body = new Uint8Array(bytes)
    const filename = generateFilename(file.name)
    const key = `${TYPE_TO_PREFIX[type]}/${category}/${filename}`

    const filePath = await uploadToS3(body, key, file.type)

    return NextResponse.json({
      fileName: filename,
      key,
      filePath,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
