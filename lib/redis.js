import { Redis } from '@upstash/redis'

let redis = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else {
  console.warn('Redis configuration missing. Inventory features will be disabled.')
}

export default redis

export const INVENTORY_PREFIX = 'inventory:'

export async function getInventory(inventoryId) {
  if (!redis) return null
  
  try {
    const quantity = await redis.get(`${INVENTORY_PREFIX}${inventoryId}`)
    return quantity !== null ? parseInt(quantity, 10) : 0
  } catch (error) {
    console.error('Error getting inventory:', error)
    return null
  }
}

export async function setInventory(inventoryId, quantity) {
  if (!redis) return false
  
  try {
    await redis.set(`${INVENTORY_PREFIX}${inventoryId}`, quantity)
    return true
  } catch (error) {
    console.error('Error setting inventory:', error)
    return false
  }
}

export async function decrementInventory(inventoryId, amount = 1) {
  if (!redis) return null
  
  try {
    const newQuantity = await redis.decrby(`${INVENTORY_PREFIX}${inventoryId}`, amount)
    return Math.max(0, newQuantity)
  } catch (error) {
    console.error('Error decrementing inventory:', error)
    return null
  }
}

export async function incrementInventory(inventoryId, amount = 1) {
  if (!redis) return null
  
  try {
    const newQuantity = await redis.incrby(`${INVENTORY_PREFIX}${inventoryId}`, amount)
    return newQuantity
  } catch (error) {
    console.error('Error incrementing inventory:', error)
    return null
  }
}

export async function getAllInventory() {
  if (!redis) return {}
  
  try {
    const keys = await redis.keys(`${INVENTORY_PREFIX}*`)
    if (!keys || keys.length === 0) return {}
    
    const inventory = {}
    for (const key of keys) {
      const inventoryId = key.replace(INVENTORY_PREFIX, '')
      const quantity = await redis.get(key)
      inventory[inventoryId] = parseInt(quantity, 10) || 0
    }
    
    return inventory
  } catch (error) {
    console.error('Error getting all inventory:', error)
    return {}
  }
}