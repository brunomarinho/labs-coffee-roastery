import { NextResponse } from 'next/server'
import { getAllInventory, setInventory, incrementInventory, decrementInventory } from '@/lib/redis'
import { loadProducts } from '@/utils/loadProducts'
import { requireAdminAuth, getClientIP } from '@/lib/auth-middleware'
import { logAdminAction } from '@/lib/audit-log'
import { getAvailableInventory } from '@/lib/redis-reservations'
import redis from '@/lib/redis'

export const GET = requireAdminAuth(async (req) => {
  try {
    // Load all products from YAML files
    const products = await loadProducts()
    
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
    
    // Process each product and check Redis entries individually
    const productsWithInventory = await Promise.all(
      products.map(async product => {
        // Use inventoryId from YAML or generate standard format inv_XXX
        const inventoryId = product.inventoryId || `inv_${product.id}`
        
        // Check if Redis entry exists for this inventory
        let quantity = 0
        let hasRedisEntry = false
        
        if (redis) {
          try {
            const redisQuantity = await redis.get(`inventory:${inventoryId}`)
            if (redisQuantity !== null) {
              quantity = parseInt(redisQuantity, 10)
              hasRedisEntry = true
            }
          } catch (error) {
            console.warn(`Failed to get quantity for ${inventoryId}:`, error)
          }
        }
        
        const reserved = reservedQuantities[inventoryId] || 0
        let available = 0
        
        // Only calculate availability if Redis entry exists
        if (hasRedisEntry) {
          available = await getAvailableInventory(inventoryId)
        }
        
        return {
          id: product.id,
          inventoryId,
          name: product.name,
          category: product.category,
          quantity,
          reserved,
          available,
          hasRedisEntry,
          isNew: !hasRedisEntry, // Mark as new if no Redis entry
          soldOut: hasRedisEntry ? available <= 0 : true // Treat unconfigured as sold out
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
    
    // Check if inventory entry exists in Redis
    let oldQuantity = 0
    let isNewEntry = false
    
    if (redis) {
      try {
        const existingQuantity = await redis.get(`inventory:${inventoryId}`)
        if (existingQuantity !== null) {
          oldQuantity = parseInt(existingQuantity, 10)
        } else {
          isNewEntry = true
        }
      } catch (error) {
        console.warn(`Failed to check existing inventory for ${inventoryId}:`, error)
      }
    }
    
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
      
      // Auto-create Redis entry if it doesn't exist
      if (!redis) {
        throw new Error('Redis not available')
      }
      
      try {
        await redis.set(`inventory:${inventoryId}`, quantity)
        newQuantity = quantity
        
        if (isNewEntry) {
          console.log(`Created new inventory entry for ${inventoryId} with quantity ${quantity}`)
        }
      } catch (error) {
        console.error(`Failed to set inventory for ${inventoryId}:`, error)
        throw new Error('Failed to set inventory')
      }
    }

    // Log the admin action
    await logAdminAction({
      action: isNewEntry ? 'create_inventory' : 'update_inventory',
      ip: getClientIP(req),
      sessionToken: req.adminAuth?.sessionToken,
      timestamp: new Date().toISOString(),
      inventoryId,
      oldValue: oldQuantity,
      newValue: newQuantity,
      operation: operation || 'set',
      isNewEntry,
      details: isNewEntry 
        ? `Created new inventory entry ${inventoryId} with quantity ${newQuantity}`
        : `Updated ${inventoryId} from ${oldQuantity} to ${newQuantity}`
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