#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const template = `# Café [ID] - [Variedade]
# [Produtor] - [Fazenda]

id: "[ID]"
inventoryId: "inv_[ID]"
slug: cafe-[ID]
name: "[ID]"
featured: false
category: coffee

# Descrição e Notas
description: >
  Descrição do café aqui...
notas: Notas de degustação

# Comercial
price: 60
quantity: 100g
stripePriceId: price_PLACEHOLDER

# Informações do Café
produtor: Nome do Produtor
fazenda: Nome da Fazenda
regiao: Região, Estado
variedade: Variedade
processo: Processamento
torra: Clara

# Recomendações de Preparo
descanso: 2-3 semanas pós torra
filtrados: temperatura, proporção, método
espresso: temperatura, proporção

# Imagens
images:
  - /images/products/[ID]a.jpg
  - /images/products/[ID]b.jpg
`

function createNewProduct() {
  const productId = process.argv[2]
  
  if (!productId) {
    console.log('❌ Usage: node scripts/new-product.js <product-id>')
    console.log('📝 Example: node scripts/new-product.js 004')
    process.exit(1)
  }
  
  // Validate product ID format
  if (!/^[a-zA-Z0-9-]+$/.test(productId)) {
    console.log('❌ Product ID can only contain letters, numbers, and hyphens')
    process.exit(1)
  }
  
  const productsDir = path.join(__dirname, '..', 'data', 'products')
  const filePath = path.join(productsDir, `${productId}.yaml`)
  
  // Check if product already exists
  if (fs.existsSync(filePath)) {
    console.log(`❌ Product ${productId}.yaml already exists!`)
    console.log(`📁 Path: ${filePath}`)
    process.exit(1)
  }
  
  // Create products directory if it doesn't exist
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true })
    console.log(`✅ Created products directory: ${productsDir}`)
  }
  
  // Replace placeholders in template
  const content = template.replace(/\[ID\]/g, productId)
  
  // Write the file
  fs.writeFileSync(filePath, content)
  
  console.log(`✅ Created new product file: ${productId}.yaml`)
  console.log(`📁 Location: ${filePath}`)
  console.log(`\n📝 Next steps:`)
  console.log(`1. Edit ${productId}.yaml with actual product information`)
  console.log(`2. Add product images to /public/images/products/`)
  console.log(`3. Create Stripe price and update stripePriceId`)
  console.log(`4. Test the product page: /produtos/cafe-${productId}`)
  console.log(`\n💡 Template sections to update:`)
  console.log(`- Product title and producer info (comments at top)`)
  console.log(`- Description and tasting notes`)
  console.log(`- Coffee details (producer, farm, region, variety, process, roast)`)
  console.log(`- Preparation recommendations`)
  console.log(`- Image paths`)
  console.log(`- Stripe price ID`)
}

// Run the script
if (require.main === module) {
  try {
    createNewProduct()
  } catch (error) {
    console.error('❌ Error creating product:', error.message)
    process.exit(1)
  }
}

module.exports = { createNewProduct }