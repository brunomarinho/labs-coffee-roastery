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
    sitemap: 'https://mystore.com/sitemap.xml',
  }
}