import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://induslens.com'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/indian-stories`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/industv`,                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/indus-eminence`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/our-contributors`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/intelligence`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/intelligence/worldview`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/specials`,                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/about-us`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact-us`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Published IndusLens articles
  const indusLensArticles = await db.article.findMany({
    where: { status: 'PUBLISHED', siteId: 'induslens' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const articleRoutes: MetadataRoute.Sitemap = indusLensArticles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Published Indian Stories articles
  const indianStoriesArticles = await db.article.findMany({
    where: { status: 'PUBLISHED', siteId: 'industales' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const indianStoriesRoutes: MetadataRoute.Sitemap = indianStoriesArticles.map((a) => ({
    url: `${BASE_URL}/indian-stories/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Categories
  const categories = await db.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { order: 'asc' },
  })

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // IndusTV videos
  const videos = await db.video.findMany({
    where: { status: 'Published', category: 'industv' },
    select: { slug: true, publishedAt: true },
    orderBy: { order: 'asc' },
  })

  const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${BASE_URL}/industv/${v.slug}`,
    lastModified: v.publishedAt ?? new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...indianStoriesRoutes,
    ...categoryRoutes,
    ...videoRoutes,
  ]
}
