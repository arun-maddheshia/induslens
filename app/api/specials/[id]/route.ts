import { NextResponse } from 'next/server'
import { getSpecialById, updateSpecial, deleteSpecial } from '@/lib/db-specials'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const special = await getSpecialById(params.id)
  if (!special) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(special)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const special = await updateSpecial(params.id, body)
  return NextResponse.json(special)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteSpecial(params.id)
  return NextResponse.json({ ok: true })
}
