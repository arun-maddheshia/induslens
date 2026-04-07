import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hydratePostImages } from "@/lib/image-storage";

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }

    const { categoryId } = params;

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Fetch articles for the specific category, ordered by categoryOrder
    const articles = await db.article.findMany({
      where: {
        categoryId: categoryId,
        status: "PUBLISHED",
        visibility: true
      },
      orderBy: [
        { categoryOrder: 'asc' },
        { publishedAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          select: {
            imageCategory: true,
            imageCategoryValue: true,
            imageDescription: true,
            imageUrl: true
          }
        },
        categoryRef: {
          select: {
            id: true,
            name: true,
            slug: true,
            isNews: true,
          }
        }
      },
    });

    // Transform data to match Article interface
    const transformedArticles = articles.map((article) => ({
      _id: article.id,
      headline: article.headline || '',
      excerpt: article.excerpt || '',
      articleBody: article.articleBody || '',
      datePublished: article.publishedAt?.toISOString() || '',
      dateCreated: article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: article.author ? [{
        id: article.author.id,
        name: article.author.name || ''
      }] : [],
      categories: article.categoryRef ? [article.categoryRef.id] : [],
      category: article.categoryRef?.id || '',
      categoryIsNews: article.categoryRef?.isNews ?? false,
      categorySlug: article.categoryRef?.slug || '',
      newsType: 'article',
      agency: 'IndusLens',
      alternativeHeadline: article.alternativeHeadline || '',
      ampValidationMessage: '',
      archivedAt: '',
      contentType: 'article' as any,
      editor: '',
      expires: '',
      genre: [],
      keywords: [],
      language: 'en',
      locationCreated: '',
      mainEntityOfPage: '',
      metaDescription: article.metaDescription || '',
      metaTitle: article.metaTitle || '',
      pageContent: article.pageContent || '',
      publishedAt: article.publishedAt?.toISOString() || '',
      publisher: 'IndusLens',
      siteId: '1',
      sourceType: 'original',
      subCategories: [],
      tags: [],
      url: `/category/${article.categoryRef?.slug}/${article.slug}` || '',
      key: parseInt(article.id.slice(-6), 16),
      isContent: true,
      description: article.alternativeHeadline || '',
      name: article.headline || '',
      slug: article.slug || '',
      status: article.status,
      visibility: article.visibility || true,
      optionalfield: '',
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      images: hydratePostImages(
        (article.images || []).map((img) => ({
          imageCategory: img.imageCategory || "article",
          imageCategoryValue: img.imageCategoryValue || "",
          imageDescription: img.imageDescription || "",
          imageUrl: img.imageUrl || [],
          key: article.id,
        })),
        "articles"
      ),
    }));

    return NextResponse.json({
      success: true,
      data: transformedArticles,
      total: transformedArticles.length
    });

  } catch (error) {
    console.error('Error fetching category articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category articles',
        data: []
      },
      { status: 500 }
    );
  }
}