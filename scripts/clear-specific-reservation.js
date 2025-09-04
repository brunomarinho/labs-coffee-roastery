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

async function clearSpecificReservation() {
  if (!redis) {
    console.error('Redis not available - check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  try {
    const sessionId = 'cs_live_a19OXYsTbFYEc5TPGnu4IKJPdYt6zjx2aztjS1pP4KU5HNNoIAWoNO2FNw';
    const inventoryId = 'inv_001';
    
    console.log('Clearing stale reservation...');
    console.log(`Session: ${sessionId}`);
    console.log(`Inventory: ${inventoryId}\n`);
    
    // Get current state
    const inventoryKey = `inventory:${inventoryId}`;
    const reservedKey = `reserved:${inventoryId}`;
    const reservationKey = `reservation:${sessionId}`;
    
    const inventory = await redis.get(inventoryKey);
    const reserved = await redis.get(reservedKey);
    const reservation = await redis.get(reservationKey);
    
    console.log('Current state:');
    console.log(`  Inventory: ${inventory}`);
    console.log(`  Reserved: ${reserved}`);
    console.log(`  Reservation value: ${reservation}\n`);
    
    // Clear the reservation
    if (reservation) {
      const quantity = parseInt(reservation);
      
      // Delete the reservation
      await redis.del(reservationKey);
      console.log(`✓ Deleted reservation key: ${reservationKey}`);
      
      // Decrement the reserved counter
      if (reserved && parseInt(reserved) >= quantity) {
        const newReserved = Math.max(0, parseInt(reserved) - quantity);
        if (newReserved === 0) {
          await redis.del(reservedKey);
          console.log(`✓ Cleared reserved counter (was ${reserved})`);
        } else {
          await redis.set(reservedKey, newReserved);
          console.log(`✓ Updated reserved counter: ${reserved} -> ${newReserved}`);
        }
      }
    } else {
      console.log('No reservation found for this session');
      
      // Force clear the reserved counter if it exists
      if (reserved && parseInt(reserved) > 0) {
        console.log(`\nForce clearing reserved counter: ${reserved} -> 0`);
        await redis.del(reservedKey);
        console.log(`✓ Force cleared reserved counter`);
      }
    }
    
    // Show final state
    console.log('\nFinal state:');
    const finalInventory = await redis.get(inventoryKey);
    const finalReserved = await redis.get(reservedKey);
    const available = Math.max(0, (parseInt(finalInventory || 0) - parseInt(finalReserved || 0)));
    
    console.log(`  Inventory: ${finalInventory || 0}`);
    console.log(`  Reserved: ${finalReserved || 0}`);
    console.log(`  Available: ${available}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearSpecificReservation();