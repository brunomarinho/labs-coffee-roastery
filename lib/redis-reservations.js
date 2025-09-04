import redis from '@/lib/redis';
import logger from '@/lib/logger';

// Lua script for atomic reservation checking and creation
const RESERVE_INVENTORY_SCRIPT = `
  local inventoryKey = KEYS[1]
  local reservedKey = KEYS[2]
  local reservationKey = KEYS[3]
  local quantity = tonumber(ARGV[1])
  local sessionId = ARGV[2]
  local ttl = tonumber(ARGV[3])
  
  -- Get current inventory and reserved count
  local current = tonumber(redis.call('get', inventoryKey) or 0)
  local reserved = tonumber(redis.call('get', reservedKey) or 0)
  
  -- Check if enough inventory is available
  local available = current - reserved
  if available >= quantity then
    -- Increment reserved counter
    redis.call('incrby', reservedKey, quantity)
    redis.call('expire', reservedKey, ttl)
    
    -- Store reservation details
    redis.call('setex', reservationKey, ttl, quantity)
    
    return 1
  end
  
  return 0
`;

// Lua script for releasing a reservation
const RELEASE_RESERVATION_SCRIPT = `
  local reservedKey = KEYS[1]
  local reservationKey = KEYS[2]
  
  -- Get reservation quantity
  local quantity = tonumber(redis.call('get', reservationKey) or 0)
  
  if quantity > 0 then
    -- Decrement reserved counter
    local newReserved = redis.call('decrby', reservedKey, quantity)
    
    -- Ensure it doesn't go negative
    if newReserved < 0 then
      redis.call('set', reservedKey, 0)
    end
    
    -- Delete reservation
    redis.call('del', reservationKey)
    
    return quantity
  end
  
  return 0
`;

// Lua script for confirming purchase (decrement inventory and release reservation)
const CONFIRM_PURCHASE_SCRIPT = `
  local inventoryKey = KEYS[1]
  local reservedKey = KEYS[2]
  local reservationKey = KEYS[3]
  
  -- Get reservation quantity
  local quantity = tonumber(redis.call('get', reservationKey) or 0)
  
  if quantity > 0 then
    -- Get current inventory to check if we can decrement
    local currentInventory = tonumber(redis.call('get', inventoryKey) or 0)
    
    -- Only decrement if we have enough inventory
    if currentInventory >= quantity then
      redis.call('decrby', inventoryKey, quantity)
    else
      -- Set to 0 if we would go negative
      redis.call('set', inventoryKey, 0)
    end
    
    -- Decrement reserved counter (safe to do)
    local newReserved = redis.call('decrby', reservedKey, quantity)
    if newReserved < 0 then
      redis.call('set', reservedKey, 0)
    end
    
    -- Delete reservation
    redis.call('del', reservationKey)
    
    return quantity
  end
  
  return 0
`;

export const RESERVATION_TTL = 600; // 10 minutes in seconds
export const MINIMUM_INVENTORY_BUFFER = 0; // No buffer - allow selling all units

// Safeguard: Maximum reservations per inventory item
export const MAX_RESERVATIONS_PER_ITEM = 25;

// Safeguard: Maximum concurrent reservations per IP (to prevent abuse)
export const MAX_RESERVATIONS_PER_IP = 5;

/**
 * Reserve inventory for a checkout session with safeguards
 * @param {string} inventoryId - The inventory ID
 * @param {string} sessionId - The Stripe session ID
 * @param {number} quantity - The quantity to reserve
 * @param {string} clientIP - The client IP address (optional, for rate limiting)
 * @returns {Promise<{success: boolean, error?: string}>} - Reservation result
 */
export async function reserveInventory(inventoryId, sessionId, quantity = 1, clientIP = null) {
  // Input validation
  if (!inventoryId || !sessionId) {
    return { success: false, error: 'Missing required parameters' };
  }

  if (quantity < 1 || quantity > 10) {
    return { success: false, error: 'Invalid quantity' };
  }

  if (!redis) {
    logger.error('Redis not available for inventory reservation');
    // Fail-safe: In production, you might want to allow the purchase to proceed
    // For now, we'll fail securely
    return { success: false, error: 'Sistema temporariamente indisponível' };
  }

  try {
    // Safeguard 1: Check if reservation already exists for this session
    const existingReservation = await getReservation(sessionId);
    if (existingReservation !== null) {
      logger.log(`Reservation already exists for session ${sessionId}`);
      return { success: true }; // Already reserved
    }

    // Safeguard 2: Check reserved counter limits
    const reservedKey = `reserved:${inventoryId}`;
    const currentReserved = await redis.get(reservedKey);
    if (currentReserved && parseInt(currentReserved) >= MAX_RESERVATIONS_PER_ITEM) {
      logger.log(`Too many reservations for ${inventoryId}: ${currentReserved}`);
      return { success: false, error: 'Limite de reservas atingido' };
    }

    // Safeguard 3: IP-based rate limiting (optional)
    if (clientIP) {
      const ipReservationKey = `ip_reservations:${clientIP}`;
      const ipReservations = await redis.get(ipReservationKey);
      if (ipReservations && parseInt(ipReservations) >= MAX_RESERVATIONS_PER_IP) {
        logger.log(`Too many concurrent reservations for IP ${clientIP}`);
        return { success: false, error: 'Muitas reservas simultâneas' };
      }
    }

    // Perform atomic reservation
    const inventoryKey = `inventory:${inventoryId}`;
    const reservationKey = `reservation:${sessionId}`;

    const result = await redis.eval(
      RESERVE_INVENTORY_SCRIPT,
      [inventoryKey, reservedKey, reservationKey],
      [quantity, sessionId, RESERVATION_TTL]
    );

    if (result === 1) {
      // Increment IP reservation counter if IP is provided
      if (clientIP) {
        const ipReservationKey = `ip_reservations:${clientIP}`;
        await redis.incr(ipReservationKey);
        await redis.expire(ipReservationKey, RESERVATION_TTL);
      }

      logger.log(`Reserved ${quantity} units of ${inventoryId} for session ${sessionId}`);
      return { success: true };
    } else {
      logger.log(`Failed to reserve ${inventoryId} - insufficient inventory`);
      return { success: false, error: 'Produto esgotado' };
    }
  } catch (error) {
    logger.error('Error reserving inventory:', error);
    return { success: false, error: 'Erro ao processar reserva' };
  }
}

/**
 * Release a reservation (e.g., when checkout expires)
 * @param {string} inventoryId - The inventory ID
 * @param {string} sessionId - The Stripe session ID
 * @returns {Promise<number>} - The quantity that was released
 */
export async function releaseReservation(inventoryId, sessionId) {
  if (!redis) {
    logger.error('Redis not available for releasing reservation');
    return 0;
  }

  try {
    const reservedKey = `reserved:${inventoryId}`;
    const reservationKey = `reservation:${sessionId}`;

    const result = await redis.eval(
      RELEASE_RESERVATION_SCRIPT,
      [reservedKey, reservationKey],
      []
    );

    if (result > 0) {
      logger.log(`Released ${result} units of ${inventoryId} from session ${sessionId}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Error releasing reservation:', error);
    return 0;
  }
}

/**
 * Confirm a purchase (decrement inventory and release reservation)
 * @param {string} inventoryId - The inventory ID
 * @param {string} sessionId - The Stripe session ID
 * @returns {Promise<number>} - The quantity that was purchased
 */
export async function confirmPurchase(inventoryId, sessionId) {
  if (!redis) {
    logger.error('Redis not available for confirming purchase');
    return 0;
  }

  try {
    const inventoryKey = `inventory:${inventoryId}`;
    const reservedKey = `reserved:${inventoryId}`;
    const reservationKey = `reservation:${sessionId}`;

    const result = await redis.eval(
      CONFIRM_PURCHASE_SCRIPT,
      [inventoryKey, reservedKey, reservationKey],
      []
    );

    if (result > 0) {
      logger.log(`Confirmed purchase of ${result} units of ${inventoryId} for session ${sessionId}`);
    }
    
    return result;
  } catch (error) {
    logger.error('Error confirming purchase:', error);
    return 0;
  }
}

/**
 * Get available inventory (actual - reserved)
 * @param {string} inventoryId - The inventory ID
 * @returns {Promise<number>} - Available inventory count
 */
export async function getAvailableInventory(inventoryId) {
  if (!redis) {
    logger.warn('Redis not available - returning 0 availability');
    return 0;
  }

  try {
    const inventoryKey = `inventory:${inventoryId}`;
    const reservedKey = `reserved:${inventoryId}`;

    const [inventory, reserved] = await Promise.all([
      redis.get(inventoryKey),
      redis.get(reservedKey)
    ]);

    const current = parseInt(inventory || 0);
    const reservedCount = parseInt(reserved || 0);
    const available = Math.max(0, current - reservedCount - MINIMUM_INVENTORY_BUFFER);

    return available;
  } catch (error) {
    logger.error('Error getting available inventory:', error);
    return 0;
  }
}

/**
 * Clean up orphaned reservations older than TTL
 * @returns {Promise<number>} - Number of reservations cleaned
 */
export async function cleanupOrphanedReservations() {
  if (!redis) {
    logger.error('Redis not available for cleanup');
    return 0;
  }

  try {
    // Get all reservation keys
    const reservationKeys = await redis.keys('reservation:*');
    let cleaned = 0;

    for (const key of reservationKeys) {
      // Check if key has expired (TTL returns -2 for non-existent keys)
      const ttl = await redis.ttl(key);
      
      if (ttl === -1) {
        // Key exists but has no expiry - this is an orphaned reservation
        // Extract session ID from key
        const sessionId = key.replace('reservation:', '');
        
        // Try to find the associated inventory ID
        // For now, we'll just delete the orphaned reservation
        await redis.del(key);
        cleaned++;
        
        logger.log(`Cleaned orphaned reservation: ${sessionId}`);
      }
    }

    // Also clean up reserved counters without corresponding reservations
    const reservedKeys = await redis.keys('reserved:*');
    
    for (const reservedKey of reservedKeys) {
      const ttl = await redis.ttl(reservedKey);
      if (ttl === -1) {
        // Reset orphaned reserved counter
        await redis.set(reservedKey.replace('reserved:', 'inventory:'), 0);
        await redis.del(reservedKey);
        logger.log(`Reset orphaned reserved counter: ${reservedKey}`);
      }
    }

    return cleaned;
  } catch (error) {
    logger.error('Error cleaning up reservations:', error);
    return 0;
  }
}

/**
 * Get reservation details
 * @param {string} sessionId - The Stripe session ID
 * @returns {Promise<number|null>} - The reserved quantity or null
 */
export async function getReservation(sessionId) {
  if (!redis) return null;

  try {
    const reservationKey = `reservation:${sessionId}`;
    const quantity = await redis.get(reservationKey);
    return quantity ? parseInt(quantity) : null;
  } catch (error) {
    logger.error('Error getting reservation:', error);
    return null;
  }
}