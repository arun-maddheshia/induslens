import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const type = formData.get('type') as string || 'articles' // Default to articles

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'No category specified' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${extension}`

    // Create directory path - handle both articles and anchors
    const basePath = type === 'authors' ? 'anchors' : 'articles'
    const categoryPath = join(process.cwd(), 'public', 'assets', basePath, category)

    // Ensure directory exists
    if (!existsSync(categoryPath)) {
      await mkdir(categoryPath, { recursive: true })
    }

    // Save file
    const filePath = join(categoryPath, filename)
    await writeFile(filePath, buffer)

    // Return the public URL path
    const publicPath = `/assets/${basePath}/${category}/${filename}`

    return NextResponse.json({
      filePath: publicPath,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}