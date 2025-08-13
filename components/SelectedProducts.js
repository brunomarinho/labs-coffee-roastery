import ProductCard from './ProductCard'
import productsData from '../data/products.json'

export default function SelectedProducts() {
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