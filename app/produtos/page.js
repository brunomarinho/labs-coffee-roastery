import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductsWithInventory from '../../components/ProductsWithInventory'
import getProductsData from '../../utils/loadProducts'

// Force dynamic rendering due to real-time inventory checks
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cafés - Mameluca Café',
  description: 'Explore nossa coleção de cafés brasileiros de torra clara.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mamelucacafe.com.br'}/produtos`,
  },
}

export default function Products() {
  const productsData = getProductsData()

  return (
    <>
      <Header />
      <main className="container">
        <h1>Cafés</h1>
        <ProductsWithInventory 
          products={productsData.products} 
          categories={productsData.categories} 
        />
      </main>
      <Footer />
    </>
  )
}