import { notFound } from 'next/navigation'
import Script from 'next/script'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import ProductDetailClient from '../../../components/ProductDetailClient'
import getProductsData from '../../../utils/loadProducts'

export async function generateStaticParams() {
  const productsData = getProductsData()
  // Only generate static params for visible products
  return productsData.products
    .filter(product => product.visible !== false)
    .map((product) => ({
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'
  
  return {
    title: `${product.name} - Mameluca`,
    description: product.description,
    keywords: `${product.name}, café ${product.processo}, ${product.regiao}, ${product.variedade}, café especial brasileiro`,
    openGraph: {
      title: `${product.name} - Mameluca`,
      description: product.description,
      images: [{
        url: product.images[0],
        width: 1200,
        height: 630,
        alt: `${product.name} - ${product.notas}`,
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - Mameluca`,
      description: product.description,
      images: [product.images[0]],
    },
    alternates: {
      canonical: `${baseUrl}/produtos/${slug}`,
    },
  }
}

export default async function ProductDetail({ params }) {
  const { slug } = await params
  const productsData = getProductsData()
  const product = productsData.products.find(p => p.slug === slug)

  // Return 404 if product doesn't exist or is hidden
  if (!product || product.visible === false) {
    notFound()
  }

  // Generate structured data for the product
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'Mameluca'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Mameluca'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1
    } : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Produtor',
        value: product.produtor
      },
      {
        '@type': 'PropertyValue',
        name: 'Processo',
        value: product.processo
      },
      {
        '@type': 'PropertyValue',
        name: 'Região',
        value: product.regiao
      },
      {
        '@type': 'PropertyValue',
        name: 'Variedade',
        value: product.variedade
      }
    ].filter(prop => prop.value)
  }

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <Header />
      <main className="container">
        <ProductDetailClient product={product} categories={productsData.categories} />
      </main>
      <Footer />
    </>
  )
}