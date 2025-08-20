import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

function loadAllProducts() {
  const productsDir = path.join(process.cwd(), 'data', 'products')
  const categoriesPath = path.join(process.cwd(), 'data', 'categories.yaml')
  
  try {
    // Load categories
    const categoriesContent = fs.readFileSync(categoriesPath, 'utf8')
    const { categories } = yaml.load(categoriesContent)
    
    // Check if products directory exists
    if (!fs.existsSync(productsDir)) {
      console.warn('Products directory does not exist:', productsDir)
      return { products: [], categories: categories || [] }
    }
    
    // Load all product files
    const productFiles = fs.readdirSync(productsDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
    
    const products = []
    
    for (const file of productFiles) {
      try {
        const filePath = path.join(productsDir, file)
        const content = fs.readFileSync(filePath, 'utf8')
        const product = yaml.load(content)
        
        // Validate that the product has required fields
        if (product && product.id && product.name) {
          products.push(product)
        } else {
          console.warn(`Invalid product data in file: ${file}`)
        }
      } catch (fileError) {
        console.error(`Error parsing product file ${file}:`, fileError.message)
      }
    }
    
    // Sort products by ID for consistent ordering
    products.sort((a, b) => {
      // Handle numeric IDs (001, 002) vs string IDs (blend)
      const aId = a.id.toString()
      const bId = b.id.toString()
      
      // If both are numeric, sort numerically
      if (/^\d+$/.test(aId) && /^\d+$/.test(bId)) {
        return parseInt(aId) - parseInt(bId)
      }
      
      // Otherwise sort alphabetically
      return aId.localeCompare(bId)
    })
    
    return { products, categories: categories || [] }
  } catch (error) {
    console.error('Error loading product data:', error.message)
    return { products: [], categories: [] }
  }
}

// Cache for production to avoid re-reading files on every request
let cachedData = null
let lastCacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in development, indefinite in production

export default function getProductsData() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const now = Date.now()
  
  // In development, cache for a short time to allow for quick editing
  // In production, cache indefinitely until restart
  const shouldRefreshCache = !cachedData || 
    (isDevelopment && lastCacheTime && (now - lastCacheTime > CACHE_DURATION))
  
  if (shouldRefreshCache) {
    cachedData = loadAllProducts()
    lastCacheTime = now
    
    if (isDevelopment) {
      console.log(`🔄 Reloaded product data (${cachedData.products.length} products)`)
    }
  }
  
  return cachedData
}

// Helper function to get a single product by ID or slug
export function getProduct(identifier) {
  const { products } = getProductsData()
  return products.find(product => 
    product.id === identifier || product.slug === identifier
  )
}

// Helper function to get products by category
export function getProductsByCategory(categoryId) {
  const { products } = getProductsData()
  return products.filter(product => product.category === categoryId)
}

// Helper function to get featured products
export function getFeaturedProducts() {
  const { products } = getProductsData()
  return products.filter(product => product.featured === true)
}

// Helper function to get available (not sold out) products
// Note: These functions now work with YAML data only, 
// inventory-based soldOut logic should be handled in components
export function getAvailableProducts() {
  const { products } = getProductsData()
  return products // Return all products since soldOut is removed from YAML
}

// Helper function to get sold out products  
// Note: This is deprecated - use inventory-based logic instead
export function getSoldOutProducts() {
  const { products } = getProductsData()
  return [] // Return empty array since soldOut is removed from YAML
}

// Named export for loadProducts (used by inventory system)
export async function loadProducts() {
  const { products } = getProductsData()
  return products
}