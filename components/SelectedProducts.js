import ProductCard from './ProductCard'
import getProductsData from '../utils/loadProducts'

export default function SelectedProducts() {
  const productsData = getProductsData()
  const featuredProducts = productsData.products
    .filter(product => product.featured && !product.soldOut)
    .slice(0, 4)

  return (
    <section className="container">
      <div className="product-grid">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} categories={productsData.categories} />
        ))}
      </div>
    </section>
  )
}