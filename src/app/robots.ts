import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/', '/profile/', '/settings/'],
      },
    ],
    sitemap: 'https://sappio.ai/sitemap.xml',
  }
}
