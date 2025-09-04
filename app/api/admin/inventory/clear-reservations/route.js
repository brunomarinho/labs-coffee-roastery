import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { Redis } from '@upstash/redis';
import { addAuditLog } from '@/lib/audit-log';
import logger from '@/lib/logger';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function handler(req) {
  if (!redis) {
    return NextResponse.json({ error: 'Inventory system not available' }, { status: 503 });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                  req.headers.get('x-real-ip') || 
                  'unknown';

  try {
    const cleared = {
      reservations: [],
      reservedCounters: [],
    };

    // Clear all reservations
    const reservationKeys = await redis.keys('reservation:*');
    
    for (const key of reservationKeys) {
      const sessionId = key.replace('reservation:', '');
      const quantity = await redis.get(key);
      
      await redis.del(key);
      cleared.reservations.push({ sessionId, quantity });
      
      logger.log(`Cleared reservation ${sessionId}: ${quantity} units`);
    }

    // Reset all reserved counters
    const reservedKeys = await redis.keys('reserved:*');
    
    for (const key of reservedKeys) {
      const inventoryId = key.replace('reserved:', 'inv_');
      const oldValue = await redis.get(key);
      
      await redis.del(key);
      cleared.reservedCounters.push({ inventoryId, oldValue });
      
      logger.log(`Reset reserved counter for ${inventoryId}: was ${oldValue}`);
    }

    // Log the action
    await addAuditLog({
      action: 'clear_all_reservations',
      userId: 'admin',
      details: {
        clearedReservations: cleared.reservations.length,
        clearedCounters: cleared.reservedCounters.length,
        items: cleared,
      },
      ip: clientIp,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'All reservations cleared',
      cleared,
    });
  } catch (error) {
    logger.error('Error clearing reservations:', error);
    return NextResponse.json({ error: 'Failed to clear reservations' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
export const DELETE = withAuth(handler);