import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { decrementInventory } from '@/lib/redis'

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
        
        if (inventoryId) {
          // Decrement inventory by 1
          const newQuantity = await decrementInventory(inventoryId, 1)
          
          console.log(`Inventory updated for ${inventoryId}: new quantity = ${newQuantity}`)
          
          // You could also update product soldOut status in a database here
          // if newQuantity === 0
        }
        
        // Log successful payment
        console.log('Payment successful:', {
          sessionId: session.id,
          productId: session.metadata?.product_id,
          inventoryId: inventoryId,
          customerEmail: session.customer_details?.email,
          amount: session.amount_total / 100, // Convert from cents
        })
        
        break
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object
        
        // If you implement inventory holds, release them here
        console.log('Checkout session expired:', session.id)
        
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