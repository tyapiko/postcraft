import { MetadataRoute } from 'next'

const BASE_URL = 'https://chapiko-ai.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/settings/',
          '/notifications/',
          '/history/',
          '/generate/',
          '/invite/',
          '/quiz/',
          '/learn/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
