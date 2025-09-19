import { getBaseUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/admin/*',
        '/api/admin/*'
      ],
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  }
}