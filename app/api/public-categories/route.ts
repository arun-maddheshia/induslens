import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/lib/db-categories";

export async function GET(request: NextRequest) {
  try {
    const siteId = new URL(request.url).searchParams.get("siteId") || undefined
    const result = await getAllCategories(1, 100, { siteId });

    // Transform data to match the ArticleCategory interface
    const categories = result.categories.map(category => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      isNews: category.isNews,
      order: category.order,
      articleCount: category._count?.articles || 0
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        data: []
      },
      { status: 500 }
    );
  }
}