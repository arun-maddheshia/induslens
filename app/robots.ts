import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://induslens.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
