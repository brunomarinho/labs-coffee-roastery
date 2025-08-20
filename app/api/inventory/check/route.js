import { NextResponse } from 'next/server'
import { getInventory } from '@/lib/redis'

export async function POST(req) {
  try {
    const { inventoryId } = await req.json()
    
    if (!inventoryId) {
      return NextResponse.json(
        { error: 'inventoryId é obrigatório' },
        { status: 400 }
      )
    }
    
    const quantity = await getInventory(inventoryId)
    
    if (quantity === null) {
      return NextResponse.json({
        inventoryId,
        quantity: 0,
        available: false,
        message: 'Inventário não configurado'
      })
    }
    
    return NextResponse.json({
      inventoryId,
      quantity,
      available: quantity > 0
    })
  } catch (error) {
    console.error('Error checking inventory:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar inventário' },
      { status: 500 }
    )
  }
}