import { getAllInventory } from '@/lib/redis'
import ProductCard from './ProductCard'

export default async function ProductsWithInventory({ products, categories }) {
  // Get inventory data on the server side
  let inventory = {}
  try {
    inventory = await getAllInventory()
  } catch (error) {
    console.error('Error fetching inventory:', error)
    // Continue without inventory data
  }
  
  // Add inventory status to products
  const productsWithInventory = products.map(product => {
    const inventoryId = product.inventoryId || `inv_${product.id}`
    const quantity = inventory[inventoryId] || 0
    
    return {
      ...product,
      soldOut: quantity === 0,
      quantity: quantity
    }
  })
  
  const availableProducts = productsWithInventory.filter(product => !product.soldOut)
  const soldOutProducts = productsWithInventory.filter(product => product.soldOut)
  
  const availableProductsByCategory = categories.map(category => ({
    ...category,
    products: availableProducts.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)
  
  const soldOutProductsByCategory = categories.map(category => ({
    ...category,
    products: soldOutProducts.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)

  return (
    <>
      {availableProductsByCategory.length > 0 && (
        <>
          <h2>Cafés disponíveis</h2>
          {availableProductsByCategory.map((category) => (
            <div key={category.id} className="category-section">
              <div className="product-grid">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} categories={categories} />
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
              <div className="product-grid">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} categories={categories} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}