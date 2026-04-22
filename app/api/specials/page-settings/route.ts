import { NextResponse } from 'next/server'
import { getSpecialsPage, updateSpecialsPage } from '@/lib/db-specials'

export async function GET() {
  const page = await getSpecialsPage()
  return NextResponse.json(page)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const page = await updateSpecialsPage(body)
  return NextResponse.json(page)
}
