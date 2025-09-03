import getProductsData from '../utils/loadProducts'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export const dynamic = 'force-static'

export default function sitemap() {
  const productsData = getProductsData()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'
  
  // Static pages
  const staticPages = [
    '',
    '/produtos',
    '/sobre',
    '/contato',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
  
  // Product pages (only visible products)
  const productPages = productsData.products
    .filter(product => product.visible !== false)
    .map((product) => ({
      url: `${baseUrl}/produtos/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  
  // Blog pages
  const blogDirectory = path.join(process.cwd(), 'content', 'blog')
  let blogPages = []
  
  try {
    const files = fs.readdirSync(blogDirectory)
    blogPages = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(blogDirectory, file)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(fileContent)
        
        // Skip hidden posts
        if (data.visibility === false) {
          return null
        }
        
        return {
          url: `${baseUrl}/blog/${file.replace('.md', '')}`,
          lastModified: data.date ? new Date(data.date) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }
      })
      .filter(Boolean) // Remove null entries
  } catch (error) {
    console.error('Error reading blog posts for sitemap:', error)
  }
  
  return [...staticPages, ...productPages, ...blogPages]
}