'use client'

import { useState, useEffect, useCallback } from 'react'

export default function InventoryStatus({ inventoryId, children }) {
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkInventory = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventoryId }),
      })

      if (!response.ok) {
        throw new Error('Failed to check inventory')
      }

      const data = await response.json()
      setInventory(data)
      setError(null)
    } catch (err) {
      console.error('Error checking inventory:', err)
      setError(err.message)
      // On error, assume available to not block sales
      setInventory({ available: true, quantity: null })
    } finally {
      setLoading(false)
    }
  }, [inventoryId])

  useEffect(() => {
    if (!inventoryId) {
      setLoading(false)
      return
    }

    checkInventory()
    
    // Refresh inventory every 30 seconds
    const interval = setInterval(checkInventory, 30000)
    
    // Listen for inventory update events (triggered when reservation is released)
    const handleInventoryUpdate = () => {
      console.log('Inventory update event received, refreshing...')
      checkInventory()
    }
    
    window.addEventListener('inventoryUpdated', handleInventoryUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate)
    }
  }, [inventoryId, checkInventory])

  if (loading) {
    return children({ loading: true, available: true, quantity: null, lowStock: false })
  }

  if (error || !inventory) {
    return children({ loading: false, available: true, quantity: null, lowStock: false })
  }

  const lowStock = inventory.quantity !== null && inventory.quantity > 0 && inventory.quantity < 5

  return children({
    loading: false,
    available: inventory.available,
    quantity: inventory.quantity,
    lowStock,
    message: inventory.message
  })
}