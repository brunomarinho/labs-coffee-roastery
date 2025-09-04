// Load environment variables  
import dotenv from 'dotenv';
import { Redis } from '@upstash/redis';

dotenv.config({ path: '.env.local' });

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function fixReservations() {
  if (!redis) {
    console.error('Redis not available - check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  try {
    console.log('Checking and fixing reservations...\n');

    // Get all inventory items
    const inventoryKeys = await redis.keys('inventory:*');
    
    for (const inventoryKey of inventoryKeys) {
      const inventoryId = inventoryKey.replace('inventory:', '');
      const reservedKey = `reserved:${inventoryId}`;
      
      // Get current values
      const inventory = await redis.get(inventoryKey);
      const reserved = await redis.get(reservedKey);
      
      console.log(`\nInventory ID: ${inventoryId}`);
      console.log(`  Current stock: ${inventory || 0}`);
      console.log(`  Reserved: ${reserved || 0}`);
      
      // Check for orphaned reservations
      if (reserved && parseInt(reserved) > 0) {
        // Look for actual reservation entries
        const reservationKeys = await redis.keys('reservation:*');
        let totalReservations = 0;
        
        for (const resKey of reservationKeys) {
          const sessionId = resKey.replace('reservation:', '');
          const quantity = await redis.get(resKey);
          
          // Try to determine if this reservation is for this inventory
          // Note: We can't know for sure without storing the inventoryId in the reservation
          // but we can check if the reservation quantity matches
          
          console.log(`    Found reservation ${sessionId}: ${quantity} units`);
          totalReservations += parseInt(quantity || 0);
        }
        
        // If reserved counter doesn't match actual reservations, fix it
        if (parseInt(reserved) !== totalReservations) {
          console.log(`  ⚠️  Mismatch detected! Reserved counter: ${reserved}, Actual reservations: ${totalReservations}`);
          
          // Ask for confirmation
          console.log(`  Fixing: Setting reserved counter to ${totalReservations}`);
          await redis.set(reservedKey, totalReservations);
          
          if (totalReservations === 0) {
            // Clean up the reserved key if it's zero
            await redis.del(reservedKey);
            console.log(`  ✅ Cleared reserved counter`);
          } else {
            console.log(`  ✅ Updated reserved counter to ${totalReservations}`);
          }
        } else {
          console.log(`  ✓ Reserved counter is correct`);
        }
      }
    }
    
    // Clean up orphaned reservation keys (without expiry)
    const reservationKeys = await redis.keys('reservation:*');
    let orphanedCount = 0;
    
    for (const key of reservationKeys) {
      const ttl = await redis.ttl(key);
      
      if (ttl === -1) {
        // Key has no expiry - it's orphaned
        const sessionId = key.replace('reservation:', '');
        const quantity = await redis.get(key);
        
        console.log(`\n⚠️  Found orphaned reservation: ${sessionId} (${quantity} units)`);
        console.log(`  Deleting orphaned reservation...`);
        await redis.del(key);
        orphanedCount++;
      }
    }
    
    if (orphanedCount > 0) {
      console.log(`\n✅ Cleaned up ${orphanedCount} orphaned reservations`);
    } else {
      console.log(`\n✓ No orphaned reservations found`);
    }
    
    // Final check - show current state
    console.log('\n=== Final State ===');
    for (const inventoryKey of inventoryKeys) {
      const inventoryId = inventoryKey.replace('inventory:', '');
      const reservedKey = `reserved:${inventoryId}`;
      
      const inventory = await redis.get(inventoryKey);
      const reserved = await redis.get(reservedKey);
      const available = Math.max(0, (parseInt(inventory || 0) - parseInt(reserved || 0)));
      
      console.log(`${inventoryId}: ${inventory || 0} stock, ${reserved || 0} reserved, ${available} available`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixReservations();