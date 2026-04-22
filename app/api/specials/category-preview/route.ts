import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId')
  if (!categoryId) return NextResponse.json({ count: 0 })

  const count = await db.article.count({
    where: { categoryId, status: 'PUBLISHED', visibility: true },
  })

  return NextResponse.json({ count })
}
