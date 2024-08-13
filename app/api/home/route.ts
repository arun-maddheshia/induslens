import { articles } from '@/data/articles';
import { FeaturedArticleIds } from '@/lib/constant';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Filter and sort articles based on featuredArticleIds
  const sortedArticles = FeaturedArticleIds.map((id) =>
    articles.find((article) => article._id === id)
  ).filter((article) => article !== undefined) as Article[];

  return NextResponse.json({
    status: 200,
    data: sortedArticles,
    message: 'Featured articles',
  });
}
