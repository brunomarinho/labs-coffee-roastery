#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

function migrateJsonToYaml() {
  console.log('🔄 Starting migration from JSON to YAML...')
  
  // Read the current products.json
  const productsJsonPath = path.join(__dirname, '..', 'data', 'products.json')
  
  if (!fs.existsSync(productsJsonPath)) {
    console.error('❌ products.json not found at:', productsJsonPath)
    process.exit(1)
  }
  
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'))
  
  // Create backup
  const backupPath = productsJsonPath + '.backup'
  fs.copyFileSync(productsJsonPath, backupPath)
  console.log('✅ Backup created at:', backupPath)
  
  // Create data/products directory
  const productsDir = path.join(__dirname, '..', 'data', 'products')
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true })
    console.log('✅ Created products directory:', productsDir)
  }
  
  // Create categories.yaml
  const categoriesPath = path.join(__dirname, '..', 'data', 'categories.yaml')
  const categoriesContent = {
    categories: productsData.categories
  }
  
  fs.writeFileSync(categoriesPath, yaml.dump(categoriesContent, {
    indent: 2,
    lineWidth: 80,
    noRefs: true
  }))
  console.log('✅ Created categories.yaml')
  
  // Create individual product YAML files
  let migrated = 0
  
  for (const product of productsData.products) {
    const productYaml = createProductYaml(product)
    const filename = `${product.id}.yaml`
    const filepath = path.join(productsDir, filename)
    
    fs.writeFileSync(filepath, productYaml)
    console.log(`✅ Created ${filename}`)
    migrated++
  }
  
  console.log(`\n🎉 Migration completed successfully!`)
  console.log(`📊 Migrated ${migrated} products`)
  console.log(`📁 Products directory: ${productsDir}`)
  console.log(`📁 Categories file: ${categoriesPath}`)
  console.log(`💾 Backup saved at: ${backupPath}`)
  console.log(`\n🚀 Next steps:`)
  console.log(`1. Review the generated YAML files`)
  console.log(`2. Run the project to test the new loader`)
  console.log(`3. If everything works, you can remove the backup file`)
}

function createProductYaml(product) {
  // Extract product name from description or use a default format
  const productTitle = `Café ${product.name}${product.variedade ? ` - ${product.variedade}` : ''}`
  const producerInfo = product.produtor && product.fazenda ? 
    `${product.produtor} - ${product.fazenda}` : 
    (product.produtor || product.fazenda || 'Informações do produtor')
  
  // Build the YAML content with comments
  let yamlContent = `# ${productTitle}\n`
  yamlContent += `# ${producerInfo}\n\n`
  
  // Basic product info
  yamlContent += `id: "${product.id}"\n`
  yamlContent += `slug: ${product.slug}\n`
  yamlContent += `name: "${product.name}"\n`
  yamlContent += `featured: ${product.featured}\n`
  yamlContent += `soldOut: ${product.soldOut}\n`
  yamlContent += `category: ${product.category}\n\n`
  
  // Description and notes
  yamlContent += `# Descrição e Notas\n`
  yamlContent += `description: >\n`
  yamlContent += `  ${product.description}\n`
  if (product.notas) {
    yamlContent += `notas: ${product.notas}\n`
  }
  yamlContent += `\n`
  
  // Commercial info
  yamlContent += `# Comercial\n`
  yamlContent += `price: ${product.price}\n`
  yamlContent += `quantity: ${product.quantity}\n`
  yamlContent += `stripePriceId: ${product.stripePriceId}\n\n`
  
  // Coffee information
  yamlContent += `# Informações do Café\n`
  if (product.produtor) yamlContent += `produtor: ${product.produtor}\n`
  if (product.fazenda) yamlContent += `fazenda: ${product.fazenda}\n`
  if (product.regiao) yamlContent += `regiao: ${product.regiao}\n`
  if (product.variedade) yamlContent += `variedade: ${product.variedade}\n`
  if (product.processo) yamlContent += `processo: ${product.processo}\n`
  if (product.torra) yamlContent += `torra: ${product.torra}\n`
  yamlContent += `\n`
  
  // Preparation recommendations (if available)
  if (product.descanso || product.filtrados || product.espresso) {
    yamlContent += `# Recomendações de Preparo\n`
    if (product.descanso) yamlContent += `descanso: ${product.descanso}\n`
    if (product.filtrados) yamlContent += `filtrados: ${product.filtrados}\n`
    if (product.espresso) yamlContent += `espresso: ${product.espresso}\n`
    yamlContent += `\n`
  }
  
  // Images
  yamlContent += `# Imagens\n`
  yamlContent += `images:\n`
  for (const image of product.images) {
    yamlContent += `  - ${image}\n`
  }
  
  return yamlContent
}

// Run the migration
if (require.main === module) {
  try {
    migrateJsonToYaml()
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

module.exports = { migrateJsonToYaml }