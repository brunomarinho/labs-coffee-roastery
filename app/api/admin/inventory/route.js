import { NextResponse } from 'next/server'
import { getAllInventory, setInventory, incrementInventory, decrementInventory } from '@/lib/redis'
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

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }
  
  try {
    const products = await loadProducts()
    const inventory = await getAllInventory()
    
    const productsWithInventory = products.map(product => {
      const inventoryId = product.inventoryId || `inv_${product.id}`
      const quantity = inventory[inventoryId] || 0
      return {
        id: product.id,
        inventoryId,
        name: product.name,
        category: product.category,
        quantity,
        soldOut: quantity === 0
      }
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
}

export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }
  
  try {
    const { inventoryId, quantity, operation } = await req.json()
    
    if (!inventoryId) {
      return NextResponse.json(
        { error: 'inventoryId é obrigatório' },
        { status: 400 }
      )
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
      const success = await setInventory(inventoryId, quantity)
      if (!success) {
        throw new Error('Failed to set inventory')
      }
      newQuantity = quantity
    }
    
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
}