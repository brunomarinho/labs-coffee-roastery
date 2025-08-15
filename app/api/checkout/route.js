import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import getProductsData from '../../../utils/loadProducts'

// Initialize Stripe only when needed to avoid build-time errors
let stripe

// CPF validation function
function isValidCPF(cpf) {
  // Remove all non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '')
  
  // Check if CPF has 11 digits
  if (cpf.length !== 11) return false
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validate CPF using the algorithm
  let sum = 0
  let remainder
  
  // First verification digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false
  
  // Second verification digit
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false
  
  return true
}

// Format CPF with mask
function formatCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '')
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export async function POST(request) {
  try {
    // Initialize Stripe if not already done
    if (!stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY não configurada')
      }
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    // Find the product in the data
    const productsData = getProductsData()
    const product = productsData.products.find(p => p.id === productId)
    
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (product.soldOut) {
      return NextResponse.json({ error: 'Produto esgotado' }, { status: 400 })
    }

    // Get the base URL for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Create Stripe checkout session with custom fields
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/obrigado`,
      cancel_url: `${origin}/produtos/${product.slug}`,
      // Shipping address collection for Brazil
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
      // Custom fields for CPF and cellphone
      custom_fields: [
        {
          key: 'cpf',
          label: {
            type: 'custom',
            custom: 'CPF (000.000.000-00 ou 00000000000)',
          },
          type: 'text',
          text: {
            minimum_length: 11,
            maximum_length: 14,
          },
          optional: false,
        },
        {
          key: 'cellphone',
          label: {
            type: 'custom',
            custom: 'Celular (Necessário para entrega)',
          },
          type: 'text',
          text: {
            minimum_length: 10,
            maximum_length: 15,
          },
          optional: false,
        },
      ],
      // Add metadata for tracking
      metadata: {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    )
  }
}