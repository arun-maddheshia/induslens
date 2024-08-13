import { contentBlockData } from '@/data/content-block';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  const slug = url.searchParams.get('slug') || '';

  let filteredData = contentBlockData;

  if (category) {
    filteredData = filteredData
      .filter((article) => article.category === category)
      .sort((a, b) => {
        if (slug) {
          const normalName = slug.replace('_', ' ');
          if (a.name === normalName) return -1;
          if (b.name === normalName) return 1;
        }
        return 0;
      });
  }

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  const response: PaginatedResponse<Eminence> = {
    totalItems,
    totalPages,
    currentPage: page,
    data: paginatedData,
  };

  return NextResponse.json(response);
}
