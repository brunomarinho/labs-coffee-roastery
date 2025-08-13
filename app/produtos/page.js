import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCard from '../../components/ProductCard'
import productsData from '../../data/products.json'

export const metadata = {
  title: 'Produtos - Mameluca',
  description: 'Explore nossa coleção completa de cafés brasileiros de torra clara.',
}

export default function Products() {
  const availableProducts = productsData.products.filter(product => !product.soldOut)
  const soldOutProducts = productsData.products.filter(product => product.soldOut)
  
  const availableProductsByCategory = productsData.categories.map(category => ({
    ...category,
    products: availableProducts.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)
  
  const soldOutProductsByCategory = productsData.categories.map(category => ({
    ...category,
    products: soldOutProducts.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)

  return (
    <>
      <Header />
      <main className="container">
        
          <h1>Todos os Produtos</h1>
        
        {availableProductsByCategory.length > 0 && (
          <>
            <h2>Cafés disponíveis</h2>
            {availableProductsByCategory.map((category) => (
              <div key={category.id} className="category-section">
                {/* <h3 className="category-title">{category.displayName}</h3> */}
                <div className="product-grid">
                  {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} categories={productsData.categories} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
        
        {soldOutProductsByCategory.length > 0 && (
          <>
            <h2>Cafés anteriores</h2>
            {soldOutProductsByCategory.map((category) => (
              <div key={category.id} className="category-section">
                {/*<h3 className="category-title">{category.displayName}</h3> */}
                <div className="product-grid">
                  {category.products.map((product) => (
                    <ProductCard key={product.id} product={product} categories={productsData.categories} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}