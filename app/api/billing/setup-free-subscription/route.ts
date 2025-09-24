import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const FREE_PRICE_ID = 'price_1SAgo7CCFNRAwpJserQa3BZG'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if there's a pending billing customer for this user
    const { data: pendingCustomer, error: customerError } = await supabase
      .from('billing_customers')
      .select('*')
      .eq('workspace_id', user.id)
      .eq('gateway_name', 'stripe')
      .like('gateway_customer_id', 'pending_%')
      .single()

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Error fetching pending customer:', customerError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!pendingCustomer) {
      return NextResponse.json({ message: 'No pending customer setup found' }, { status: 200 })
    }

    // Create Stripe customer (this will trigger webhook customer.created)
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: (pendingCustomer.metadata as any)?.full_name || user.email,
      metadata: {
        user_id: user.id,
        workspace_id: user.id
      }
    })

    console.log('Created Stripe customer:', stripeCustomer.id)

    // Create free subscription (this will trigger webhook customer.subscription.created)
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [
        {
          price: FREE_PRICE_ID,
        },
      ],
      metadata: {
        user_id: user.id,
        workspace_id: user.id,
        plan_type: 'free'
      }
    })

    console.log('Created Stripe subscription:', subscription.id)

    // Update the billing customer record
    const { error: updateError } = await supabase
      .from('billing_customers')
      .update({
        gateway_customer_id: stripeCustomer.id,
        metadata: {
          ...(pendingCustomer.metadata as any),
          status: 'active',
          stripe_customer_created_at: new Date().toISOString(),
          subscription_id: subscription.id
        }
      })
      .eq('workspace_id', pendingCustomer.workspace_id)
      .eq('gateway_customer_id', pendingCustomer.gateway_customer_id)

    if (updateError) {
      console.error('Error updating billing customer:', updateError)
      return NextResponse.json({ error: 'Failed to update customer record' }, { status: 500 })
    }

    // Create notification for successful setup
    await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        type: 'info',
        message: 'Your free subscription is now active!',
        link: '/billing'
      })

    return NextResponse.json({
      message: 'Free subscription setup complete',
      customer_id: stripeCustomer.id,
      subscription_id: subscription.id
    })

  } catch (error) {
    console.error('Error setting up free subscription:', error)
    return NextResponse.json(
      { error: 'Failed to setup free subscription' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if setup is needed
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for pending customer
    const { data: pendingCustomer, error: customerError } = await supabase
      .from('billing_customers')
      .select('*')
      .eq('workspace_id', user.id)
      .eq('gateway_name', 'stripe')
      .like('gateway_customer_id', 'pending_%')
      .single()

    if (customerError && customerError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      setup_needed: !!pendingCustomer,
      pending_customer: pendingCustomer || null
    })

  } catch (error) {
    console.error('Error checking setup status:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}