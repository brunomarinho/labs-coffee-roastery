import { Redis } from '@upstash/redis'
import logger from './logger.js'

let redis = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else {
  logger.warn('Redis configuration missing. Inventory features will be disabled.')
}

export default redis

export const INVENTORY_PREFIX = 'inventory:'

export async function getInventory(inventoryId) {
  if (!redis) return null
  
  try {
    const quantity = await redis.get(`${INVENTORY_PREFIX}${inventoryId}`)
    return quantity !== null ? parseInt(quantity, 10) : 0
  } catch (error) {
    logger.error('Error getting inventory:', error)
    return null
  }
}

export async function setInventory(inventoryId, quantity) {
  if (!redis) return false
  
  try {
    await redis.set(`${INVENTORY_PREFIX}${inventoryId}`, quantity)
    return true
  } catch (error) {
    logger.error('Error setting inventory:', error)
    return false
  }
}

// Lua script for atomic decrement that prevents negative inventory
const SAFE_DECREMENT_SCRIPT = `
  local key = KEYS[1]
  local amount = tonumber(ARGV[1])
  
  local current = tonumber(redis.call('get', key) or 0)
  
  if current >= amount then
    return redis.call('decrby', key, amount)
  else
    -- Don't go negative, just set to 0
    if current > 0 then
      redis.call('set', key, 0)
    end
    return 0
  end
`;

export async function decrementInventory(inventoryId, amount = 1) {
  if (!redis) return null
  
  try {
    // Use Lua script for atomic check-and-decrement
    const newQuantity = await redis.eval(
      SAFE_DECREMENT_SCRIPT,
      [`${INVENTORY_PREFIX}${inventoryId}`],
      [amount]
    )
    return newQuantity
  } catch (error) {
    logger.error('Error decrementing inventory:', error)
    return null
  }
}

export async function incrementInventory(inventoryId, amount = 1) {
  if (!redis) return null
  
  try {
    const newQuantity = await redis.incrby(`${INVENTORY_PREFIX}${inventoryId}`, amount)
    return newQuantity
  } catch (error) {
    logger.error('Error incrementing inventory:', error)
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
    logger.error('Error getting all inventory:', error)
    return {}
  }
}