import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }

    // Fetch from other stories playlist with full article data
    const otherStoriesPlaylist = await db.otherStoriesPlaylist.findMany({
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                aboutTheAnchor: true,
                images: {
                  where: {
                    imageCategoryValue: 'avatar'
                  },
                  select: {
                    imageUrl: true
                  },
                  take: 1
                }
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
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Filter for published articles only and transform data
    const publishedArticles = otherStoriesPlaylist
      .filter(item => item.article !== null && item.article.status === 'PUBLISHED')
      .map(item => {
        const article = item.article!;

        // Transform to match Article interface
        return {
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
          category: article.categoryRef?.name || 'none',
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
          url: `/articles/${article.slug || article.id}`,
          key: parseInt(article.id.slice(-6), 16), // Generate numeric key from id
          isContent: true,
          description: article.alternativeHeadline || '',
          name: article.headline || '',
          slug: article.slug || '',
          status: article.status,
          visibility: article.visibility || true,
          optionalfield: '',
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          // Add images array in PostImage format
          images: (article.images || []).map(img => ({
            imageCategory: img.imageCategory || 'article',
            imageCategoryValue: img.imageCategoryValue || 'detailsPageBackground',
            imageDescription: img.imageDescription || '',
            imageUrl: img.imageUrl || [],
            key: article.id
          }))
        };
      });

    return NextResponse.json({
      success: true,
      data: publishedArticles,
      total: publishedArticles.length
    });

  } catch (error) {
    console.error("Error fetching other stories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch other stories",
        data: []
      },
      { status: 500 }
    );
  }
}