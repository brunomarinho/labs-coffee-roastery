import ProductCard from './ProductCard'
import getProductsData from '../utils/loadProducts'
import { getInventory } from '../lib/redis'
import { getAvailableInventory } from '../lib/redis-reservations'

export default async function SelectedProducts() {
  const productsData = getProductsData()
  
  // Get featured products with inventory status
  const featuredProductsWithInventory = await Promise.all(
    productsData.products
      .filter(product => product.featured)
      .slice(0, 4)
      .map(async (product) => {
        const inventoryId = product.inventoryId || `inv_${product.id}`
        let availableQuantity = 0
        
        try {
          availableQuantity = await getAvailableInventory(inventoryId)
        } catch (error) {
          console.error(`Error fetching available inventory for ${inventoryId}:`, error)
        }
        
        return {
          ...product,
          soldOut: availableQuantity === 0,
          quantity: availableQuantity
        }
      })
  )

  let productsToShow = featuredProductsWithInventory
  
  // If we have less than 2 featured products, fill remaining slots with sold out products
  if (featuredProductsWithInventory.length < 2) {
    // Get all non-featured products with inventory status
    const nonFeaturedProducts = productsData.products
      .filter(product => !product.featured)
    
    const nonFeaturedWithInventory = await Promise.all(
      nonFeaturedProducts.map(async (product) => {
        const inventoryId = product.inventoryId || `inv_${product.id}`
        let availableQuantity = 0
        
        try {
          availableQuantity = await getAvailableInventory(inventoryId)
        } catch (error) {
          console.error(`Error fetching available inventory for ${inventoryId}:`, error)
        }
        
        return { 
          ...product, 
          soldOut: availableQuantity === 0,
          quantity: availableQuantity
        }
      })
    )
    
    // Get sold out products sorted by ID in descending order
    const soldOutProducts = nonFeaturedWithInventory
      .filter(product => product.soldOut)
      .sort((a, b) => {
        // Sort by ID in descending order (last to first)
        const idA = parseInt(a.id) || 0
        const idB = parseInt(b.id) || 0
        return idB - idA
      })
    
    // Calculate how many slots we need to fill (target is 2 total products)
    const slotsToFill = 2 - featuredProductsWithInventory.length
    const fillerProducts = soldOutProducts.slice(0, slotsToFill)
    
    // Combine featured products with sold out fillers
    productsToShow = [...featuredProductsWithInventory, ...fillerProducts]
  }

  return (
    <section className="container">
      <div className="product-grid">
        {productsToShow.map((product) => (
          <ProductCard key={product.id} product={product} categories={productsData.categories} />
        ))}
      </div>
    </section>
  )
}