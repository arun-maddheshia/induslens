export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hydratePostImages } from "@/lib/image-storage"

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      throw new Error("Database connection not available")
    }

    // Fetch from hero playlist with full article data
    const heroPlaylist = await db.heroPlaylist.findMany({
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                aboutTheAnchor: true,
                images: {
                  select: {
                    imageCategory: true,
                    imageCategoryValue: true,
                    imageDescription: true,
                    imageUrl: true,
                  },
                  take: 3,
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
    })

    // Filter for published articles only
    const publishedArticles = heroPlaylist
      .filter(item => item.article !== null && item.article.status === 'PUBLISHED')
      .map(item => {
        const article = item.article!

        const authorImagesHydrated = article.author?.images?.length
          ? hydratePostImages(
              article.author.images.map((img) => ({
                imageCategory: img.imageCategory || "",
                imageCategoryValue: img.imageCategoryValue || "",
                imageDescription: img.imageDescription || "",
                imageUrl: img.imageUrl || [],
                key: "",
              })),
              "authors"
            )
          : []
        const authorCardImage =
          authorImagesHydrated[0]?.imageUrl[0] ||
          ""

        const articleImagesHydrated = hydratePostImages(
          (article.images || []).map((img) => ({
            imageCategory: img.imageCategory || "",
            imageCategoryValue: img.imageCategoryValue || "",
            imageDescription: img.imageDescription || "",
            imageUrl: img.imageUrl || [],
            key: article.id,
          })),
          "articles"
        )

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
            _id: article.author.id,
            name: article.author.name || '',
            bio: article.author.aboutTheAnchor || '',
            image: authorCardImage
          }] : [],
          categories: article.categoryRef ? [article.categoryRef.id] : [],
          category: article.categoryRef?.name || '',
          categoryIsNews: article.categoryRef?.isNews ?? false,
          categorySlug: article.categoryRef?.slug || '',
          newsType: 'article',
          agency: 'IndustLens',
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
          metaDescription: article.excerpt || '',
          metaTitle: article.headline || '',
          pageContent: article.pageContent || '',
          publishedAt: article.publishedAt?.toISOString() || '',
          publisher: 'IndustLens',
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
          visibility: true,
          optionalfield: '',
          createdAt: article.createdAt.toISOString(),
          // Add images array in PostImage format
          images: articleImagesHydrated
        }
      })

    // Split articles according to the original logic
    const [leftPosts, mainPost, rightPosts] = [
      publishedArticles.slice(1, 3),
      publishedArticles[0],
      publishedArticles.slice(3, 7),
    ]

    return NextResponse.json({
      leftPosts: leftPosts || [],
      mainPost: mainPost || null,
      rightPosts: rightPosts || []
    })

  } catch (error) {
    console.error("Error fetching featured articles:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured articles" },
      { status: 500 }
    )
  }
}