import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductsWithInventory from '../../components/ProductsWithInventory'
import getProductsData from '../../utils/loadProducts'

// Force dynamic rendering due to real-time inventory checks
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cafés - Mameluca',
  description: 'Explore nossa coleção completa de cafés brasileiros de torra clara.',
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