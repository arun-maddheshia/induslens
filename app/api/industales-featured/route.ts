import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hydratePostImages } from '@/lib/image-storage'

function toArticle(article: any): Article {
  const authorImagesHydrated = article.author?.images?.length
    ? hydratePostImages(
        article.author.images.map((img: any) => ({
          imageCategory: img.imageCategory || '',
          imageCategoryValue: img.imageCategoryValue || '',
          imageDescription: img.imageDescription || '',
          imageUrl: img.imageUrl || [],
          key: '',
        })),
        'authors'
      )
    : []

  const articleImagesHydrated = hydratePostImages(
    (article.images || []).map((img: any) => ({
      imageCategory: img.imageCategory || '',
      imageCategoryValue: img.imageCategoryValue || '',
      imageDescription: img.imageDescription || '',
      imageUrl: img.imageUrl || [],
      key: article.id,
    })),
    'articles'
  )

  return {
    _id: article.id,
    headline: article.headline || '',
    alternativeHeadline: article.alternativeHeadline || '',
    excerpt: article.excerpt || '',
    articleBody: article.articleBody || '',
    pageContent: article.pageContent || '',
    diveContent: '',
    datePublished: article.publishedAt?.toISOString() || '',
    dateCreated: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() || '',
    author: article.author
      ? [{ id: article.author.id, name: article.author.name || '' }]
      : [],
    categories: article.categoryRef ? [article.categoryRef.id] : [],
    category: article.categoryRef?.name || '',
    categoryIsNews: article.categoryRef?.isNews ?? false,
    categorySlug: article.categoryRef?.slug || '',
    newsType: 'article',
    agency: 'IndusTales',
    ampValidationMessage: '',
    archivedAt: '',
    contentType: 'articles' as any,
    editor: '',
    expires: '',
    genre: [],
    keywords: [],
    language: 'en',
    locationCreated: '',
    mainEntityOfPage: '',
    metaDescription: article.excerpt || '',
    metaTitle: article.headline || '',
    publisher: 'IndusTales',
    siteId: article.siteId || '',
    sourceType: '',
    subCategories: [],
    tags: [],
    url: `/industales/${article.slug}`,
    key: parseInt(article.id.slice(-6), 16),
    isContent: true,
    description: article.alternativeHeadline || '',
    name: article.headline || '',
    slug: article.slug || '',
    status: article.status,
    visibility: true,
    optionalfield: '',
    images: articleImagesHydrated.map((img) => ({
      ...img,
      imageCategoryValue: img.imageCategoryValue ?? '',
    })) as any,
  }
}

export async function GET() {
  try {
    const playlist = await db.indusTalesPlaylist.findMany({
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                aboutTheAnchor: true,
                images: {
                  select: { imageCategory: true, imageCategoryValue: true, imageDescription: true, imageUrl: true },
                  take: 3,
                },
              },
            },
            images: {
              select: { imageCategory: true, imageCategoryValue: true, imageDescription: true, imageUrl: true },
            },
            categoryRef: { select: { id: true, name: true, slug: true, isNews: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    const published = playlist
      .filter((item) => item.article?.status === 'PUBLISHED')
      .map((item) => toArticle(item.article))

    return NextResponse.json({
      leftPosts: published.slice(1, 3),
      mainPost: published[0] ?? null,
      rightPosts: published.slice(3, 7),
    })
  } catch (error) {
    console.error('Error fetching IndusTales featured:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
