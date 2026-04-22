import { NextResponse } from 'next/server'
import { getAllSpecials, createSpecial, updateSpecialOrders } from '@/lib/db-specials'

export async function GET() {
  const specials = await getAllSpecials()
  return NextResponse.json(specials)
}

export async function POST(req: Request) {
  const body = await req.json()
  const special = await createSpecial(body)
  return NextResponse.json(special, { status: 201 })
}

export async function PATCH(req: Request) {
  const { updates } = await req.json()
  await updateSpecialOrders(updates)
  return NextResponse.json({ ok: true })
}
