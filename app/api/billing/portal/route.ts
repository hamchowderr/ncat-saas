import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { customerId, returnUrl } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the billing customer for this user
    let { data: customer, error: customerError } = await supabase
      .from('billing_customers')
      .select('gateway_customer_id')
      .eq('workspace_id', user.id) // Assuming workspace_id maps to user_id
      .eq('gateway_name', 'stripe')
      .single()

    // If no customer exists, create one automatically
    if (customerError || !customer) {
      console.log('Creating Stripe customer for user:', user.id, user.email)

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          workspace_id: user.id
        }
      })

      // Save to database
      const { data: newCustomer, error: createError } = await supabase
        .from('billing_customers')
        .insert({
          gateway_customer_id: stripeCustomer.id,
          workspace_id: user.id,
          gateway_name: 'stripe',
          billing_email: user.email || '',
          default_currency: 'usd'
        })
        .select('gateway_customer_id')
        .single()

      if (createError) {
        console.error('Error creating billing customer:', createError)
        return NextResponse.json({
          error: 'Failed to create billing customer',
          debug: { error: createError.message }
        }, { status: 500 })
      }

      customer = newCustomer
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.gateway_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}