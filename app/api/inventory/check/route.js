import { NextResponse } from 'next/server'
import { getInventory } from '@/lib/redis'
import { getAvailableInventory } from '@/lib/redis-reservations'
import redis from '@/lib/redis'

export async function POST(req) {
  try {
    const { inventoryId } = await req.json()
    
    if (!inventoryId) {
      return NextResponse.json(
        { error: 'inventoryId é obrigatório' },
        { status: 400 }
      )
    }
    
    // Get both actual inventory and available inventory (accounting for reservations)
    const actualQuantity = await getInventory(inventoryId)
    const availableQuantity = await getAvailableInventory(inventoryId)
    
    if (actualQuantity === null) {
      return NextResponse.json({
        inventoryId,
        quantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        available: false,
        message: 'Inventário não configurado'
      })
    }

    // Get reserved quantity for additional info
    let reservedQuantity = 0
    if (redis) {
      try {
        const reserved = await redis.get(`reserved:${inventoryId}`)
        reservedQuantity = parseInt(reserved || 0)
      } catch (error) {
        console.warn('Failed to get reserved quantity:', error)
      }
    }
    
    return NextResponse.json({
      inventoryId,
      quantity: actualQuantity,
      availableQuantity,
      reservedQuantity,
      available: availableQuantity > 0,
      lowStock: availableQuantity > 0 && availableQuantity <= 5
    })
  } catch (error) {
    console.error('Error checking inventory:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar inventário' },
      { status: 500 }
    )
  }
}