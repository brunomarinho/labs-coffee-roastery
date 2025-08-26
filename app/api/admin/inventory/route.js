import { NextResponse } from 'next/server'
import { getAllInventory, setInventory, incrementInventory, decrementInventory } from '@/lib/redis'
import { loadProducts } from '@/utils/loadProducts'
import { requireAdminAuth, getClientIP } from '@/lib/auth-middleware'
import { logAdminAction } from '@/lib/audit-log'
import { getAvailableInventory } from '@/lib/redis-reservations'
import redis from '@/lib/redis'

export const GET = requireAdminAuth(async (req) => {
  try {
    const products = await loadProducts()
    const inventory = await getAllInventory()
    
    // Get reserved quantities for all inventory items
    const reservedQuantities = {}
    if (redis) {
      try {
        const reservedKeys = await redis.keys('reserved:*')
        for (const key of reservedKeys) {
          const inventoryId = key.replace('reserved:', '')
          const reserved = await redis.get(key)
          reservedQuantities[inventoryId] = parseInt(reserved || 0)
        }
      } catch (error) {
        console.warn('Failed to get reserved quantities:', error)
      }
    }
    
    const productsWithInventory = await Promise.all(
      products.map(async product => {
        const inventoryId = product.inventoryId || `inv_${product.id}`
        const quantity = inventory[inventoryId] || 0
        const reserved = reservedQuantities[inventoryId] || 0
        const available = await getAvailableInventory(inventoryId)
        
        return {
          id: product.id,
          inventoryId,
          name: product.name,
          category: product.category,
          quantity,
          reserved,
          available,
          soldOut: available <= 0
        }
      })
    )

    // Log the admin action
    await logAdminAction({
      action: 'view_inventory',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      details: `Viewed inventory for ${products.length} products`
    })
    
    return NextResponse.json({
      products: productsWithInventory,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting inventory:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inventário' },
      { status: 500 }
    )
  }
})

export const POST = requireAdminAuth(async (req) => {
  try {
    const { inventoryId, quantity, operation } = await req.json()
    
    if (!inventoryId) {
      return NextResponse.json(
        { error: 'inventoryId é obrigatório' },
        { status: 400 }
      )
    }
    
    // Get old quantity for audit logging
    const oldInventory = await getAllInventory()
    const oldQuantity = oldInventory[inventoryId] || 0
    
    let newQuantity
    
    if (operation === 'increment') {
      newQuantity = await incrementInventory(inventoryId, quantity || 1)
    } else if (operation === 'decrement') {
      newQuantity = await decrementInventory(inventoryId, quantity || 1)
    } else {
      if (quantity === undefined || quantity < 0) {
        return NextResponse.json(
          { error: 'Quantidade inválida' },
          { status: 400 }
        )
      }
      const success = await setInventory(inventoryId, quantity)
      if (!success) {
        throw new Error('Failed to set inventory')
      }
      newQuantity = quantity
    }

    // Log the admin action
    await logAdminAction({
      action: 'update_inventory',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      inventoryId,
      oldValue: oldQuantity,
      newValue: newQuantity,
      operation: operation || 'set',
      details: `Updated ${inventoryId} from ${oldQuantity} to ${newQuantity}`
    })
    
    return NextResponse.json({
      inventoryId,
      quantity: newQuantity,
      message: 'Estoque atualizado com sucesso'
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque' },
      { status: 500 }
    )
  }
})