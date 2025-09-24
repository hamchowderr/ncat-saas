import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, createServiceRoleClient } from '@/lib/server'

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
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
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

    // If no customer exists, or customer ID starts with "pending_", create one automatically
    if (customerError || !customer || customer.gateway_customer_id.startsWith('pending_')) {
      console.log('Creating Stripe customer for user:', user.id, user.email)

      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          workspace_id: user.id
        }
      })

      // Save to database using service role client to bypass RLS policies
      const serviceClient = createServiceRoleClient()
      console.log('🔧 Debug: Using service role client for billing customer creation')
      console.log('🔧 Debug: Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

      // Use upsert with service role client to handle both insert and update cases
      console.log('🔧 Debug: Using upsert to create/update billing customer record')
      const { data: newCustomer, error: createError } = await serviceClient
        .from('billing_customers')
        .upsert({
          gateway_customer_id: stripeCustomer.id,
          workspace_id: user.id,
          gateway_name: 'stripe',
          billing_email: user.email || '',
          default_currency: 'usd',
          metadata: {
            status: 'active',
            updated_at: new Date().toISOString()
          }
        }, {
          onConflict: 'workspace_id,gateway_name'
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
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
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