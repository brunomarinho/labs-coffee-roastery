import { notFound } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import ProductDetailClient from '../../../components/ProductDetailClient'
import productsData from '../../../data/products.json'

export async function generateStaticParams() {
  return productsData.products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = productsData.products.find(p => p.slug === slug)
  
  if (!product) {
    return {
      title: 'Produto Não Encontrado',
    }
  }

  return {
    title: `${product.name} - Mameluca`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

export default async function ProductDetail({ params }) {
  const { slug } = await params
  const product = productsData.products.find(p => p.slug === slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="container">
        <ProductDetailClient product={product} categories={productsData.categories} />
      </main>
      <Footer />
    </>
  )
}