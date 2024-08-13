import { articles } from '@/data/articles';
import { categories } from '@/data/categories';
import { NextResponse } from 'next/server';

interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: T[];
  category: ArticleCategory;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  const filteredCategory: ArticleCategory = categories.filter(
    (_) => _.slug === category
  )[0];

  // Filter data based on category if provided
  let filteredData = articles;

  if (!filteredCategory) {
    return NextResponse.json([]);
  }

  if (filteredCategory) {
    filteredData = filteredData.filter(
      (article) => article.category === filteredCategory.id
    );
  }

  // Paginate data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  const response: PaginatedResponse<Article> = {
    totalItems,
    totalPages,
    currentPage: page,
    data: paginatedData,
    category: filteredCategory,
  };

  return NextResponse.json(response);
}
