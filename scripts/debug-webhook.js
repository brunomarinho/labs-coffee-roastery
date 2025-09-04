// Debug script to test webhook processing
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';

dotenv.config({ path: '.env.local' });

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function debugWebhook() {
  if (!redis) {
    console.error('Redis not available');
    process.exit(1);
  }

  console.log('=== WEBHOOK DEBUG TOOL ===\n');

  // Check all reservations
  const reservationKeys = await redis.keys('reservation:*');
  console.log(`Found ${reservationKeys.length} reservation(s):\n`);

  for (const key of reservationKeys) {
    const sessionId = key.replace('reservation:', '');
    const quantity = await redis.get(key);
    const ttl = await redis.ttl(key);
    
    console.log(`Session: ${sessionId}`);
    console.log(`  Quantity: ${quantity}`);
    console.log(`  TTL: ${ttl} seconds`);
    console.log(`  Expires: ${ttl > 0 ? new Date(Date.now() + ttl * 1000).toLocaleString() : 'No expiry'}\n`);
  }

  // Check all inventory items with reservations
  const inventoryKeys = await redis.keys('inventory:*');
  console.log('\n=== INVENTORY STATUS ===\n');
  
  for (const key of inventoryKeys) {
    const inventoryId = key.replace('inventory:', '');
    const stock = await redis.get(key);
    const reserved = await redis.get(`reserved:${inventoryId}`);
    
    if (reserved && parseInt(reserved) > 0) {
      console.log(`${inventoryId}:`);
      console.log(`  Stock: ${stock}`);
      console.log(`  Reserved: ${reserved}`);
      console.log(`  Available: ${Math.max(0, parseInt(stock || 0) - parseInt(reserved || 0))}\n`);
    }
  }

  // Manual fix option
  if (process.argv[2] === 'clear') {
    const sessionId = process.argv[3];
    
    if (!sessionId) {
      console.log('\nUsage: node scripts/debug-webhook.js clear <session_id>');
      console.log('Example: node scripts/debug-webhook.js clear cs_live_xxxxx');
    } else {
      console.log(`\n=== CLEARING RESERVATION ===\n`);
      console.log(`Clearing reservation for session: ${sessionId}`);
      
      const reservationKey = `reservation:${sessionId}`;
      const quantity = await redis.get(reservationKey);
      
      if (quantity) {
        // Find which inventory this belongs to by checking reserved counters
        for (const key of inventoryKeys) {
          const inventoryId = key.replace('inventory:', '');
          const reserved = await redis.get(`reserved:${inventoryId}`);
          
          if (reserved && parseInt(reserved) > 0) {
            // Clear the reservation
            await redis.del(reservationKey);
            await redis.decrby(`reserved:${inventoryId}`, quantity);
            console.log(`✅ Cleared ${quantity} units from ${inventoryId}`);
            break;
          }
        }
      } else {
        console.log('❌ No reservation found for this session');
      }
    }
  }

  process.exit(0);
}

debugWebhook().catch(console.error);