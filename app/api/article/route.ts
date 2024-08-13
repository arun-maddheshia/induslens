import { articles } from '@/data/articles';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const article = articles[0];
  return NextResponse.json({
    status: 200,
    data: article,
    message: 'Article details',
  });
}
