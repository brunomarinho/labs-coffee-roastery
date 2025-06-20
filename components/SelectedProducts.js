import ProductCard from './ProductCard'
import productsData from '../data/products.json'

export default function SelectedProducts() {
  const featuredProducts = productsData.products
    .filter(product => product.featured)
    .slice(0, 4)

  return (
    <section className="container">
      <h2 className="text-center mt-lg mb-lg">Produtos em Destaque</h2>
      <div className="product-grid">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} categories={productsData.categories} />
        ))}
      </div>
    </section>
  )
}