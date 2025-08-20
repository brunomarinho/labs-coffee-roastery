import { NextResponse } from 'next/server'
import { setInventory, getAllInventory } from '@/lib/redis'
import { loadProducts } from '@/utils/loadProducts'

function checkAuth(req) {
  const authHeader = req.headers.get('Authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured')
    return false
  }
  
  return authHeader === adminPassword
}

export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }
  
  try {
    const products = await loadProducts()
    const existingInventory = await getAllInventory()
    
    const syncResults = []
    
    for (const product of products) {
      const inventoryId = product.inventoryId || `inv_${product.id}`
      
      if (!(inventoryId in existingInventory)) {
        const success = await setInventory(inventoryId, 0)
        syncResults.push({
          productId: product.id,
          inventoryId,
          name: product.name,
          status: success ? 'created' : 'failed',
          quantity: 0
        })
      } else {
        syncResults.push({
          productId: product.id,
          inventoryId,
          name: product.name,
          status: 'exists',
          quantity: existingInventory[inventoryId]
        })
      }
    }
    
    const created = syncResults.filter(r => r.status === 'created').length
    const existing = syncResults.filter(r => r.status === 'exists').length
    const failed = syncResults.filter(r => r.status === 'failed').length
    
    return NextResponse.json({
      message: `Sincronização concluída: ${created} criados, ${existing} existentes, ${failed} falhas`,
      results: syncResults,
      summary: {
        created,
        existing,
        failed,
        total: products.length
      }
    })
  } catch (error) {
    console.error('Error syncing inventory:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar inventário' },
      { status: 500 }
    )
  }
}