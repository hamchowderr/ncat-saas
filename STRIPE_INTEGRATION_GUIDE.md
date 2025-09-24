# Stripe Integration Guide

## Overview

This guide covers how to integrate Stripe subscription plans, customer portal, and checkout flow with your existing NCA Toolkit SaaS application.

## Current Integration Status

Your application already has a comprehensive Stripe integration with:

### Existing Infrastructure

1. **Stripe MCP Configuration** (`claude_desktop_config.json`)
   - Stripe MCP server configured with test API key
   - All tools enabled (`--tools=all`)

2. **Database Schema** (`supabase/migrations/20240101000009_billing_system_tables.sql`)
   - `billing_products` - Stripe products
   - `billing_prices` - Stripe pricing tiers
   - `billing_customers` - Customer management
   - `billing_subscriptions` - Subscription tracking
   - `billing_invoices` - Invoice management
   - `billing_payment_methods` - Payment method storage
   - `billing_usage_logs` - Usage tracking

3. **Webhook Handlers**
   - **Supabase Edge Function**: `supabase/functions/stripe-webhook/index.ts`
   - **Next.js API Route**: `app/api/stripe/webhooks/route.ts`
   - Both handle: products, prices, customers, subscriptions, invoices

## Integration Implementation Plan

### 1. Subscription Plans Setup

#### A. Create Products and Prices in Stripe

```typescript
// Create subscription plans programmatically
const plans = [
  {
    name: "Starter",
    description: "Basic plan for individuals",
    price: 9.99,
    interval: "month",
    features: ["10 projects", "Basic support", "1GB storage"]
  },
  {
    name: "Professional",
    description: "Advanced plan for teams",
    price: 29.99,
    interval: "month",
    features: ["Unlimited projects", "Priority support", "10GB storage", "Team collaboration"]
  },
  {
    name: "Enterprise",
    description: "Full-featured plan for organizations",
    price: 99.99,
    interval: "month",
    features: ["Unlimited everything", "24/7 support", "100GB storage", "Advanced analytics"]
  }
];
```

#### B. Product Management API Routes

Create API routes for managing subscription plans:

```typescript
// app/api/billing/products/route.ts - List available products
// app/api/billing/subscriptions/route.ts - Manage user subscriptions
// app/api/billing/usage/route.ts - Track usage limits
```

### 2. Checkout Flow Implementation

#### A. Checkout Session Creation

```typescript
// app/api/billing/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId, customerId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
    allow_promotion_codes: true,
  });

  return Response.json({ url: session.url });
}
```

#### B. Frontend Checkout Component

```typescript
// components/billing/checkout-button.tsx
'use client'

import { Button } from '@/components/ui/button'

interface CheckoutButtonProps {
  priceId: string
  planName: string
  customerId?: string
}

export function CheckoutButton({ priceId, planName, customerId }: CheckoutButtonProps) {
  const handleCheckout = async () => {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, customerId })
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <Button onClick={handleCheckout} className="w-full">
      Subscribe to {planName}
    </Button>
  )
}
```

### 3. Customer Portal Integration

#### A. Portal Session Creation

```typescript
// app/api/billing/portal/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { customerId } = await req.json();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
  });

  return Response.json({ url: session.url });
}
```

#### B. Portal Access Component

```typescript
// components/billing/customer-portal.tsx
'use client'

import { Button } from '@/components/ui/button'

interface CustomerPortalProps {
  customerId: string
}

export function CustomerPortal({ customerId }: CustomerPortalProps) {
  const handlePortalAccess = async () => {
    const response = await fetch('/api/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId })
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <Button variant="outline" onClick={handlePortalAccess}>
      Manage Billing
    </Button>
  )
}
```

### 4. Subscription Management

#### A. Subscription Status Hook

```typescript
// hooks/use-subscription.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/client'

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchSubscription() {
      const { data } = await supabase
        .from('billing_subscriptions')
        .select(`
          *,
          billing_customers!inner(
            workspace_id,
            workspaces!inner(
              users!inner(user_id)
            )
          ),
          billing_products(name, description, features),
          billing_prices(amount, currency, recurring_interval)
        `)
        .eq('billing_customers.workspaces.users.user_id', userId)
        .eq('status', 'active')
        .single()

      setSubscription(data)
      setLoading(false)
    }

    fetchSubscription()
  }, [userId])

  return { subscription, loading }
}
```

### 5. Usage-Based Billing

#### A. Usage Tracking

```typescript
// lib/billing/usage-tracker.ts
import { createClient } from '@/lib/client'

export async function trackUsage(
  customerId: string,
  feature: string,
  amount: number = 1
) {
  const supabase = createClient()

  await supabase
    .from('billing_usage_logs')
    .insert({
      gateway_customer_id: customerId,
      feature,
      usage_amount: amount,
      timestamp: new Date().toISOString()
    })
}

// Usage examples:
// await trackUsage(customerId, 'api_calls', 1)
// await trackUsage(customerId, 'storage_gb', 0.1)
// await trackUsage(customerId, 'video_processing_minutes', 5)
```

#### B. Usage Limits Enforcement

```typescript
// lib/billing/usage-limits.ts
export async function checkUsageLimit(
  customerId: string,
  feature: string,
  requestedAmount: number = 1
): Promise<{ allowed: boolean; currentUsage: number; limit: number }> {
  const supabase = createClient()

  // Get current subscription limits
  const { data: subscription } = await supabase
    .from('billing_subscriptions')
    .select(`
      billing_products(features),
      billing_customers!inner(gateway_customer_id)
    `)
    .eq('billing_customers.gateway_customer_id', customerId)
    .eq('status', 'active')
    .single()

  const limits = subscription?.billing_products?.features || {}
  const limit = limits[feature] || 0

  // Get current usage for this billing period
  const { data: usage } = await supabase
    .from('billing_usage_logs')
    .select('usage_amount')
    .eq('gateway_customer_id', customerId)
    .eq('feature', feature)
    .gte('timestamp', getCurrentBillingPeriodStart())

  const currentUsage = usage?.reduce((sum, log) => sum + log.usage_amount, 0) || 0
  const allowed = (currentUsage + requestedAmount) <= limit

  return { allowed, currentUsage, limit }
}
```

### 6. Frontend Components

#### A. Pricing Page

```typescript
// app/pricing/page.tsx
import { CheckoutButton } from '@/components/billing/checkout-button'

export default async function PricingPage() {
  // Fetch products from your database
  const products = await getActiveProducts()

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-12">
        Choose Your Plan
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>

            {product.prices.map((price) => (
              <div key={price.id} className="mb-4">
                <span className="text-2xl font-bold">
                  ${price.amount}/{price.recurring_interval}
                </span>
                <CheckoutButton
                  priceId={price.gateway_price_id}
                  planName={product.name}
                />
              </div>
            ))}

            <ul className="space-y-2">
              {Object.entries(product.features || {}).map(([feature, value]) => (
                <li key={feature} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}: {value}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### B. Billing Dashboard

```typescript
// app/dashboard/billing/page.tsx
import { CustomerPortal } from '@/components/billing/customer-portal'
import { SubscriptionStatus } from '@/components/billing/subscription-status'
import { UsageMetrics } from '@/components/billing/usage-metrics'

export default function BillingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Billing & Subscription</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SubscriptionStatus />
          <CustomerPortal customerId="cus_xxx" />
        </div>

        <div>
          <UsageMetrics />
        </div>
      </div>
    </div>
  )
}
```

## Next Steps

1. **Set up Stripe Products**: Create your subscription plans in Stripe Dashboard
2. **Implement API Routes**: Create the checkout and portal API endpoints
3. **Build Frontend Components**: Create pricing page and billing dashboard
4. **Test Webhooks**: Ensure webhook endpoints are properly configured
5. **Add Usage Tracking**: Implement usage limits for your specific features
6. **Configure Customer Portal**: Set up portal settings in Stripe Dashboard

## Environment Variables Required

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URLs
NEXT_PUBLIC_URL=http://localhost:3000
```

## Stripe Dashboard Configuration

1. **Products**: Create your subscription plans
2. **Webhooks**: Configure endpoint `https://yourdomain.com/api/stripe/webhooks`
3. **Customer Portal**: Enable subscription management features
4. **Tax Settings**: Configure tax collection if needed
5. **Payment Methods**: Enable desired payment options

This integration will provide a complete subscription management system with:
- ✅ Subscription plan selection
- ✅ Secure checkout flow
- ✅ Customer self-service portal
- ✅ Real-time webhook synchronization
- ✅ Usage tracking and limits
- ✅ Comprehensive billing dashboard