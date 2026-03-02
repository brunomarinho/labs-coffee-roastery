import { getAvailableInventory } from '@/lib/redis-reservations'
import ProductCard from './ProductCard'
import NoProductsPlaceholder from './NoProductsPlaceholder'
import ScrollReveal from './ScrollReveal'

export default async function ProductsWithInventory({ products, categories }) {
  // Filter out products where visible is explicitly false
  const visibleProducts = products.filter(product => product.visible !== false)
  
  // Add inventory status to visible products using available inventory (accounting for reservations)
  const productsWithInventory = await Promise.all(
    visibleProducts.map(async product => {
      const inventoryId = product.inventoryId || `inv_${product.id}`
      let availableQuantity = 0
      
      try {
        availableQuantity = await getAvailableInventory(inventoryId)
      } catch (error) {
        console.error(`Error fetching available inventory for ${inventoryId}:`, error)
        // Continue with 0 quantity
      }
      
      return {
        ...product,
        soldOut: availableQuantity === 0,
        quantity: availableQuantity,
        lowStock: availableQuantity > 0 && availableQuantity <= 5
      }
    })
  )
  
  const availableProducts = productsWithInventory.filter(product => !product.soldOut)
  const soldOutProducts = productsWithInventory.filter(product => product.soldOut)
  
  const availableProductsByCategory = categories.map(category => ({
    ...category,
    products: availableProducts.filter(product => product.category === category.id)
  })).filter(category => category.products.length > 0)
  
  const soldOutProductsByCategory = categories.map(category => ({
    ...category,
    products: soldOutProducts
      .filter(product => product.category === category.id)
      .sort((a, b) => {
        // Sort sold out products from most recent to least recent (reverse order)
        const aId = a.id.toString()
        const bId = b.id.toString()
        
        // If both are numeric, sort numerically in reverse
        if (/^\d+$/.test(aId) && /^\d+$/.test(bId)) {
          return parseInt(bId) - parseInt(aId)
        }
        
        // Otherwise sort alphabetically in reverse
        return bId.localeCompare(aId)
      })
  })).filter(category => category.products.length > 0)

  // Show placeholder if no visible products
  if (visibleProducts.length === 0) {
    return <NoProductsPlaceholder />
  }

  return (
    <>
      {availableProductsByCategory.length > 0 && (
        <>
          <div className="category-section">
            <h2 className="animate-fade-up">Disponíveis</h2>
            {availableProductsByCategory.map((category) => (
              <div key={category.id}>
                <div className="product-grid">
                  {category.products.map((product, index) => (
                    <ProductCard key={product.id} product={product} categories={categories} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {soldOutProductsByCategory.length > 0 && (
        <ScrollReveal>
          <div className="category-section">
            <h2>Anteriores</h2>
            {soldOutProductsByCategory.map((category) => (
              <div key={category.id} className="category-section">
                <div className="product-grid">
                  {category.products.map((product, index) => (
                    <ProductCard key={product.id} product={product} categories={categories} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}
    </>
  )
}