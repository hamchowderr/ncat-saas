import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'product.created':
        await handleProductCreated(event.data.object as Stripe.Product, supabase)
        break
      case 'product.updated':
        await handleProductUpdated(event.data.object as Stripe.Product, supabase)
        break
      case 'price.created':
        await handlePriceCreated(event.data.object as Stripe.Price, supabase)
        break
      case 'price.updated':
        await handlePriceUpdated(event.data.object as Stripe.Price, supabase)
        break
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer, supabase)
        break
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer, supabase)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice, supabase)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 })
  }
}

async function handleProductCreated(product: Stripe.Product, supabase: any) {
  const { error } = await supabase
    .from('billing_products')
    .upsert({
      gateway_product_id: product.id,
      gateway_name: 'stripe',
      name: product.name,
      description: product.description,
      features: product.metadata,
      active: product.active,
      is_visible_in_ui: true,
    })

  if (error) {
    console.error('Error creating product:', error)
    throw error
  }

  console.log('Product created:', product.id)
}

async function handleProductUpdated(product: Stripe.Product, supabase: any) {
  const { error } = await supabase
    .from('billing_products')
    .update({
      name: product.name,
      description: product.description,
      features: product.metadata,
      active: product.active,
    })
    .eq('gateway_product_id', product.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating product:', error)
    throw error
  }

  console.log('Product updated:', product.id)
}

async function handlePriceCreated(price: Stripe.Price, supabase: any) {
  const { error } = await supabase
    .from('billing_prices')
    .upsert({
      gateway_price_id: price.id,
      gateway_product_id: price.product as string,
      currency: price.currency,
      amount: price.unit_amount ? price.unit_amount / 100 : 0, // Convert from cents
      recurring_interval: price.recurring?.interval || 'one_time',
      recurring_interval_count: price.recurring?.interval_count || 0,
      active: price.active,
      gateway_name: 'stripe',
    })

  if (error) {
    console.error('Error creating price:', error)
    throw error
  }

  console.log('Price created:', price.id)
}

async function handlePriceUpdated(price: Stripe.Price, supabase: any) {
  const { error } = await supabase
    .from('billing_prices')
    .update({
      currency: price.currency,
      amount: price.unit_amount ? price.unit_amount / 100 : 0,
      recurring_interval: price.recurring?.interval || 'one_time',
      recurring_interval_count: price.recurring?.interval_count || 0,
      active: price.active,
    })
    .eq('gateway_price_id', price.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating price:', error)
    throw error
  }

  console.log('Price updated:', price.id)
}

async function handleCustomerCreated(customer: Stripe.Customer, supabase: any) {
  // Note: You'll need to map this to your workspace system
  // For now, we'll just store the customer data
  const { error } = await supabase
    .from('billing_customers')
    .upsert({
      gateway_customer_id: customer.id,
      gateway_name: 'stripe',
      billing_email: customer.email,
      default_currency: customer.currency,
      metadata: customer.metadata,
      // workspace_id: // You'll need to determine this based on your business logic
    })

  if (error) {
    console.error('Error creating customer:', error)
    throw error
  }

  console.log('Customer created:', customer.id)
}

async function handleCustomerUpdated(customer: Stripe.Customer, supabase: any) {
  const { error } = await supabase
    .from('billing_customers')
    .update({
      billing_email: customer.email,
      default_currency: customer.currency,
      metadata: customer.metadata,
    })
    .eq('gateway_customer_id', customer.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating customer:', error)
    throw error
  }

  console.log('Customer updated:', customer.id)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('billing_subscriptions')
    .upsert({
      gateway_customer_id: subscription.customer as string,
      gateway_name: 'stripe',
      gateway_subscription_id: subscription.id,
      gateway_product_id: subscription.items.data[0]?.price.product as string,
      gateway_price_id: subscription.items.data[0]?.price.id,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString().split('T')[0],
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString().split('T')[0],
      currency: subscription.currency,
      is_trial: subscription.trial_end ? new Date(subscription.trial_end * 1000) > new Date() : false,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString().split('T')[0] : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      quantity: subscription.items.data[0]?.quantity || 1,
    })

  if (error) {
    console.error('Error creating subscription:', error)
    throw error
  }

  console.log('Subscription created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('billing_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString().split('T')[0],
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString().split('T')[0],
      is_trial: subscription.trial_end ? new Date(subscription.trial_end * 1000) > new Date() : false,
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString().split('T')[0] : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      quantity: subscription.items.data[0]?.quantity || 1,
    })
    .eq('gateway_subscription_id', subscription.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log('Subscription updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('billing_subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('gateway_subscription_id', subscription.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error deleting subscription:', error)
    throw error
  }

  console.log('Subscription deleted:', subscription.id)
}

async function handleInvoiceCreated(invoice: Stripe.Invoice, supabase: any) {
  const { error } = await supabase
    .from('billing_invoices')
    .upsert({
      gateway_invoice_id: invoice.id,
      gateway_customer_id: invoice.customer as string,
      gateway_product_id: (invoice.lines.data[0] as any)?.price?.product as string,
      gateway_price_id: (invoice.lines.data[0] as any)?.price?.id,
      gateway_name: 'stripe',
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status || 'draft',
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString().split('T')[0] : null,
      hosted_invoice_url: invoice.hosted_invoice_url,
    })

  if (error) {
    console.error('Error creating invoice:', error)
    throw error
  }

  console.log('Invoice created:', invoice.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  const { error } = await supabase
    .from('billing_invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    })
    .eq('gateway_invoice_id', invoice.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating invoice payment succeeded:', error)
    throw error
  }

  console.log('Invoice payment succeeded:', invoice.id)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const { error } = await supabase
    .from('billing_invoices')
    .update({
      status: 'payment_failed',
    })
    .eq('gateway_invoice_id', invoice.id)
    .eq('gateway_name', 'stripe')

  if (error) {
    console.error('Error updating invoice payment failed:', error)
    throw error
  }

  console.log('Invoice payment failed:', invoice.id)
}
