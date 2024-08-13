import { anchors } from '@/data/anchor';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const totalItems = anchors.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = anchors.slice(offset, offset + limit);

    const response: PaginatedResponse<Author> = {
      totalItems,
      totalPages,
      currentPage: offset,
      data: paginatedData,
      extra: {
        offset,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error loading contributors:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
