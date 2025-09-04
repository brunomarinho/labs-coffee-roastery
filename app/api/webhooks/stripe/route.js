import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decrementInventory } from '@/lib/redis'
import { confirmPurchase, releaseReservation } from '@/lib/redis-reservations'
import logger from '@/lib/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  // Debug: Log that webhook was received
  console.log('[WEBHOOK] Received webhook request');
  
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')
  
  console.log('[WEBHOOK] Signature present:', !!sig);
  console.log('[WEBHOOK] Webhook secret configured:', !!endpointSecret);
  
  if (!endpointSecret) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
    logger.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }
  
  let event
  
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }
  
  // Process the webhook synchronously but efficiently
  // We need to ensure it actually runs
  try {
    await processWebhook(event);
  } catch (error) {
    logger.error('Error processing webhook:', error);
    // Still return success to Stripe to prevent retries for processing errors
  }
  
  return NextResponse.json({ received: true });
}

async function processWebhook(event) {
  try {
    // TEMPORARY: Debug logging for production issue
    console.log(`[WEBHOOK DEBUG] Processing: ${event.type}`, {
      sessionId: event.data.object?.id,
      inventoryId: event.data.object?.metadata?.inventory_id,
      reservationCreated: event.data.object?.metadata?.reservation_created,
    });
    
    // Log the incoming event for debugging
    logger.log(`Processing Stripe webhook: ${event.type}`, {
      sessionId: event.data.object?.id,
      metadata: event.data.object?.metadata,
    });
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Get inventory ID from metadata
        const inventoryId = session.metadata?.inventory_id
        const reservationCreated = session.metadata?.reservation_created === 'true'
        
        logger.log('Processing completed checkout:', {
          sessionId: session.id,
          inventoryId,
          reservationCreated,
          paymentStatus: session.payment_status,
        });
        
        // Only process if payment was successful
        if (session.payment_status !== 'paid') {
          logger.log('Payment not completed, skipping inventory update');
          break;
        }
        
        if (inventoryId) {
          let purchaseQuantity = 0;
          
          if (reservationCreated) {
            // Use atomic confirmation (decrements inventory and releases reservation)
            console.log(`[WEBHOOK DEBUG] Calling confirmPurchase for ${inventoryId}, session ${session.id}`);
            purchaseQuantity = await confirmPurchase(inventoryId, session.id);
            console.log(`[WEBHOOK DEBUG] confirmPurchase returned: ${purchaseQuantity}`);
            
            if (purchaseQuantity > 0) {
              console.log(`[WEBHOOK DEBUG] ✅ Success: cleared ${purchaseQuantity} units`);
              logger.log(`✅ Purchase confirmed for ${inventoryId}: ${purchaseQuantity} units processed via reservation system`);
            } else {
              console.log(`[WEBHOOK DEBUG] ⚠️ No reservation found for session ${session.id}`);
              logger.warn(`⚠️ No reservation found for session ${session.id}, checking for stale reservation...`);
              
              // Try to clean up any stale reservations for this session
              const releasedQty = await releaseReservation(inventoryId, session.id);
              if (releasedQty > 0) {
                logger.log(`🧹 Cleaned up stale reservation: ${releasedQty} units`);
              }
              
              // Fallback to direct inventory decrement
              const newQuantity = await decrementInventory(inventoryId, 1);
              logger.log(`📉 Fallback: Inventory decremented for ${inventoryId}: new quantity = ${newQuantity}`);
              purchaseQuantity = 1;
            }
          } else {
            // No reservation system - use legacy direct decrement
            const newQuantity = await decrementInventory(inventoryId, 1);
            logger.log(`📉 Legacy: Inventory decremented for ${inventoryId}: new quantity = ${newQuantity}`);
            purchaseQuantity = 1;
          }
          
          // Log successful payment with purchase details
          logger.log('Payment successful:', {
            sessionId: session.id,
            productId: session.metadata?.product_id,
            inventoryId: inventoryId,
            purchaseQuantity: purchaseQuantity,
            customerEmail: session.customer_details?.email,
            amount: session.amount_total / 100, // Convert from cents
            reservationUsed: reservationCreated,
          });
        } else {
          // Product without inventory tracking
          logger.log('Payment successful (no inventory):', {
            sessionId: session.id,
            productId: session.metadata?.product_id,
            customerEmail: session.customer_details?.email,
            amount: session.amount_total / 100,
          });
        }
        
        break
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object
        
        // Release reservation if it exists
        const inventoryId = session.metadata?.inventory_id
        const reservationCreated = session.metadata?.reservation_created === 'true'
        
        if (inventoryId && reservationCreated) {
          const releasedQuantity = await releaseReservation(inventoryId, session.id);
          
          if (releasedQuantity > 0) {
            logger.log(`Released reservation: ${releasedQuantity} units of ${inventoryId} from expired session ${session.id}`);
          } else {
            logger.log(`No reservation to release for expired session ${session.id}`);
          }
        }
        
        logger.log('Checkout session expired:', {
          sessionId: session.id,
          productId: session.metadata?.product_id,
          inventoryId: inventoryId,
          hadReservation: reservationCreated,
        });
        
        break
      }
      
      default:
        logger.log(`Unhandled event type ${event.type}`)
    }
  } catch (error) {
    logger.error('Error processing webhook:', error)
    // Don't throw here since we already returned success to Stripe
  }
}

// Note: In App Router, we handle raw body directly with req.text()
// No need for the Pages Router config export