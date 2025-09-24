import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, customerId, successUrl, cancelUrl } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    let stripeCustomerId = customerId

    // If no customer ID provided, find or create customer
    if (!stripeCustomerId) {
      // Check if customer already exists in our database
      const { data: existingCustomer } = await supabase
        .from('billing_customers')
        .select('gateway_customer_id')
        .eq('workspace_id', user.id) // Assuming workspace_id maps to user_id
        .eq('gateway_name', 'stripe')
        .single()

      if (existingCustomer) {
        stripeCustomerId = existingCustomer.gateway_customer_id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: {
            user_id: user.id,
          },
        })

        stripeCustomerId = customer.id

        // Save customer to our database
        await supabase
          .from('billing_customers')
          .insert({
            gateway_customer_id: customer.id,
            workspace_id: user.id,
            gateway_name: 'stripe',
            billing_email: user.email!,
            default_currency: 'usd',
          })
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve available products and prices
export async function GET() {
  try {
    const supabase = createClient()

    // Get active products with their prices
    const { data: products, error } = await supabase
      .from('billing_products')
      .select(`
        *,
        billing_prices!inner(*)
      `)
      .eq('active', true)
      .eq('is_visible_in_ui', true)
      .eq('billing_prices.active', true)
      .order('billing_prices.amount', { referencedTable: 'billing_prices' })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Transform the data to group prices under each product
    const productsWithPrices = products.reduce((acc: any[], product: any) => {
      const existingProduct = acc.find(p => p.gateway_product_id === product.gateway_product_id)

      if (existingProduct) {
        existingProduct.prices.push(...product.billing_prices)
      } else {
        acc.push({
          ...product,
          prices: product.billing_prices || []
        })
      }

      return acc
    }, [])

    return NextResponse.json({ products: productsWithPrices })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}