import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import productsData from '../../data/products.json'

export const metadata = {
  title: 'Produtos - Mameluca',
  description: 'Explore nossa coleção completa de cafés brasileiros de torra clara.',
}

export default function Products() {
  const productsByCategory = productsData.categories.map(category => ({
    ...category,
    products: productsData.products.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)

  return (
    <>
      <Header />
      <main className="container">
        <h1 className="text-center mt-lg mb-lg">Todos os Produtos</h1>
        
        {productsByCategory.map((category) => (
          <div key={category.id} className="category-section">
            <h2 className="category-title">{category.displayName}</h2>
            <div className="product-grid">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </>
  )
}