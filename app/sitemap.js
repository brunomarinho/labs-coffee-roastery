import getProductsData from '../utils/loadProducts'

export const dynamic = 'force-static'

export default function sitemap() {
  const productsData = getProductsData()
  const baseUrl = 'https://mystore.com'
  
  // Static pages
  const staticPages = [
    '',
    '/produtos',
    '/sobre',
    '/faq',
    '/contato',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
  
  // Product pages
  const productPages = productsData.products.map((product) => ({
    url: `${baseUrl}/produtos/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
  
  return [...staticPages, ...productPages]
}