import { notFound } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import ProductDetailClient from '../../../components/ProductDetailClient'
import getProductsData from '../../../utils/loadProducts'
import { parseMarkdown } from '../../../utils/parseMarkdown'
import { generateProductMetadata as generateSeoProductMetadata, JsonLd, generateProductSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/seo'

export async function generateStaticParams() {
  const productsData = getProductsData()
  // Generate static params for ALL products (visible and hidden)
  // Hidden products are accessible via direct URL for testing
  return productsData.products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const productsData = getProductsData()
  const product = productsData.products.find(p => p.slug === slug)

  if (!product) {
    return {
      title: 'Produto Não Encontrado',
    }
  }

  return generateSeoProductMetadata(product)
}

export default async function ProductDetail({ params }) {
  const { slug } = await params
  const productsData = getProductsData()
  const product = productsData.products.find(p => p.slug === slug)

  // Return 404 only if product doesn't exist
  // Hidden products (visible: false) are still accessible for testing
  if (!product) {
    notFound()
  }

  // Process markdown description to HTML with links
  const descriptionHtml = await parseMarkdown(product.description || '')

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cafés', url: '/produtos' },
    { name: product.name }
  ])

  const productSchema = generateProductSchema(product)
  const structuredData = combineSchemas([breadcrumbSchema, productSchema])

  return (
    <>
      <JsonLd data={structuredData} id="product-structured-data" />
      <Header />
      <main className="container">
        <ProductDetailClient 
          product={product} 
          categories={productsData.categories}
          descriptionHtml={descriptionHtml}
        />
      </main>
      <Footer />
    </>
  )
}