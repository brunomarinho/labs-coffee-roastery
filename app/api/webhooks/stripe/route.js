import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decrementInventory } from '@/lib/redis'
import { confirmPurchase, releaseReservation } from '@/lib/redis-reservations'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')
  
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }
  
  let event
  
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Get inventory ID from metadata
        const inventoryId = session.metadata?.inventory_id
        const reservationCreated = session.metadata?.reservation_created === 'true'
        
        if (inventoryId) {
          let purchaseQuantity = 0;
          
          if (reservationCreated) {
            // Use atomic confirmation (decrements inventory and releases reservation)
            purchaseQuantity = await confirmPurchase(inventoryId, session.id);
            
            if (purchaseQuantity > 0) {
              console.log(`Purchase confirmed for ${inventoryId}: ${purchaseQuantity} units processed via reservation system`);
            } else {
              console.warn(`No reservation found for session ${session.id}, falling back to direct inventory decrement`);
              // Fallback to direct inventory decrement
              const newQuantity = await decrementInventory(inventoryId, 1);
              console.log(`Fallback: Inventory decremented for ${inventoryId}: new quantity = ${newQuantity}`);
              purchaseQuantity = 1;
            }
          } else {
            // No reservation system - use legacy direct decrement
            const newQuantity = await decrementInventory(inventoryId, 1);
            console.log(`Legacy: Inventory decremented for ${inventoryId}: new quantity = ${newQuantity}`);
            purchaseQuantity = 1;
          }
          
          // Log successful payment with purchase details
          console.log('Payment successful:', {
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
          console.log('Payment successful (no inventory):', {
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
            console.log(`Released reservation: ${releasedQuantity} units of ${inventoryId} from expired session ${session.id}`);
          } else {
            console.log(`No reservation to release for expired session ${session.id}`);
          }
        }
        
        console.log('Checkout session expired:', {
          sessionId: session.id,
          productId: session.metadata?.product_id,
          inventoryId: inventoryId,
          hadReservation: reservationCreated,
        });
        
        break
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}