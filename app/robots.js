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
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'}/sitemap.xml`,
  }
}