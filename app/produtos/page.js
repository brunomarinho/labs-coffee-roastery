import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductsWithInventory from '../../components/ProductsWithInventory'
import getProductsData from '../../utils/loadProducts'
import { generateMetadata as generateSeoMetadata, getPageSeo } from '@/lib/seo'

// Force dynamic rendering due to real-time inventory checks
export const dynamic = 'force-dynamic'

const pageSeo = getPageSeo('products')
export const metadata = generateSeoMetadata({
  title: pageSeo.title,
  description: pageSeo.description,
  keywords: pageSeo.keywords,
  url: '/produtos'
})

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