#!/usr/bin/env node

/**
 * Fix Negative Inventory Script
 * 
 * This script fixes any negative inventory values in Redis by setting them to 0.
 * Run this after deploying the fix to clean up existing negative values.
 * 
 * Usage: node scripts/fix-negative-inventory.js
 */

import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function fixNegativeInventory() {
  console.log('🔧 Checking for negative inventory values...\n');
  
  try {
    // Get all inventory keys
    const inventoryKeys = await redis.keys('inventory:*');
    
    if (!inventoryKeys || inventoryKeys.length === 0) {
      console.log('No inventory entries found.');
      return;
    }
    
    let fixedCount = 0;
    const results = [];
    
    for (const key of inventoryKeys) {
      const currentValue = await redis.get(key);
      const inventoryId = key.replace('inventory:', '');
      
      if (currentValue !== null && parseInt(currentValue) < 0) {
        // Fix negative value
        await redis.set(key, 0);
        results.push({
          inventoryId,
          oldValue: currentValue,
          newValue: 0
        });
        fixedCount++;
        console.log(`✅ Fixed ${inventoryId}: ${currentValue} → 0`);
      } else {
        console.log(`✓ ${inventoryId}: ${currentValue} (OK)`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    if (fixedCount > 0) {
      console.log(`\n🎉 Fixed ${fixedCount} negative inventory value(s)\n`);
      console.log('Fixed items:');
      results.forEach(r => {
        console.log(`  - ${r.inventoryId}: ${r.oldValue} → ${r.newValue}`);
      });
    } else {
      console.log('\n✨ No negative inventory values found. All good!\n');
    }
    
  } catch (error) {
    console.error('❌ Error fixing inventory:', error);
    process.exit(1);
  }
}

// Run the fix
fixNegativeInventory();