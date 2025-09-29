import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2025-08-27.basil"
});

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Initialize Supabase client
// For Edge Functions, we need to use the internal Docker network
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "http://supabase_kong_ncat-saas:8000";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

console.log("Connecting to Supabase:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Stripe Webhook Function booted!");

Deno.serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(err.message, { status: 400 });
  }

  console.log(`🔔 Event received: ${receivedEvent.id} - ${receivedEvent.type}`);

  // Check if we've already processed this event to prevent duplicates
  const { data: existingEvent } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", receivedEvent.id)
    .single();

  if (existingEvent) {
    console.log(`⚠️ Event ${receivedEvent.id} already processed, skipping`);
    return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Log this event as being processed
  await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: receivedEvent.id,
    event_type: receivedEvent.type,
    processed_at: new Date().toISOString()
  });

  try {
    // Handle different event types
    switch (receivedEvent.type) {
      case "product.created":
      case "product.updated":
        await handleProductEvent(receivedEvent.data.object as Stripe.Product);
        break;

      case "price.created":
      case "price.updated":
        await handlePriceEvent(receivedEvent.data.object as Stripe.Price);
        break;

      case "customer.created":
      case "customer.updated":
        await handleCustomerEvent(receivedEvent.data.object as Stripe.Customer);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(receivedEvent.data.object as Stripe.Subscription);
        break;

      case "invoice.created":
      case "invoice.updated":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.paid":
      case "invoice.finalized":
        await handleInvoiceEvent(receivedEvent.data.object as Stripe.Invoice);
        break;

      case "payment_intent.created":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
        await handlePaymentIntentEvent(receivedEvent.data.object as Stripe.PaymentIntent);
        break;

      case "charge.succeeded":
      case "charge.failed":
        await handleChargeEvent(receivedEvent.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});

async function handleProductEvent(product: Stripe.Product) {
  const { error } = await supabase.from("billing_products").upsert({
    gateway_product_id: product.id,
    gateway_name: "stripe",
    name: product.name,
    description: product.description,
    features: product.metadata,
    active: product.active,
    is_visible_in_ui: product.active
  });

  if (error) {
    console.error("Error upserting product:", error);
    throw error;
  }

  console.log(`✅ Product ${product.id} synced`);
}

async function handlePriceEvent(price: Stripe.Price) {
  const { error } = await supabase.from("billing_prices").upsert({
    gateway_price_id: price.id,
    gateway_product_id: price.product as string,
    currency: price.currency,
    amount: price.unit_amount || 0,
    recurring_interval: price.recurring?.interval || "one_time",
    recurring_interval_count: price.recurring?.interval_count || 1,
    active: price.active,
    tier: price.metadata?.tier || null,
    free_trial_days: price.recurring?.trial_period_days || null,
    gateway_name: "stripe"
  });

  if (error) {
    // If foreign key constraint fails, it might be a race condition - wait and retry once
    if (error.code === "23503" && error.details?.includes("billing_products")) {
      console.warn("Product not found, retrying price sync after delay...", error.details);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { error: retryError } = await supabase.from("billing_prices").upsert({
        gateway_price_id: price.id,
        gateway_product_id: price.product as string,
        currency: price.currency,
        amount: price.unit_amount || 0,
        recurring_interval: price.recurring?.interval || "one_time",
        recurring_interval_count: price.recurring?.interval_count || 1,
        active: price.active,
        tier: price.metadata?.tier || null,
        free_trial_days: price.recurring?.trial_period_days || null,
        gateway_name: "stripe"
      });

      if (retryError) {
        console.error("Error upserting price after retry:", retryError);
        throw retryError;
      }
    } else {
      console.error("Error upserting price:", error);
      throw error;
    }
  }

  console.log(`✅ Price ${price.id} synced`);
}

async function handleCustomerEvent(customer: Stripe.Customer) {
  // Extract user_id from customer metadata
  const userId = customer.metadata?.user_id || customer.metadata?.workspace_id;

  if (!userId) {
    console.warn(
      "Customer missing user_id in metadata:",
      customer.id,
      "- skipping (likely test data)"
    );
    return; // Don't throw error for test customers, just skip
  }

  // Check if there's a pending customer record for this user
  const { data: pendingCustomer } = await supabase
    .from("billing_customers")
    .select("*")
    .eq("workspace_id", userId)
    .eq("gateway_name", "stripe")
    .like("gateway_customer_id", "pending_%")
    .single();

  // If there's a pending record, update it; otherwise insert new
  if (pendingCustomer) {
    const { error } = await supabase
      .from("billing_customers")
      .update({
        gateway_customer_id: customer.id,
        default_currency: customer.currency || "usd",
        billing_email: customer.email || "",
        metadata: {
          ...pendingCustomer.metadata,
          stripe_customer_created: true,
          stripe_metadata: customer.metadata || {}
        }
      })
      .eq("id", pendingCustomer.id);

    if (error) {
      console.error("Error updating pending customer:", error);
      throw error;
    }
  } else {
    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("billing_customers")
      .select("*")
      .eq("gateway_customer_id", customer.id)
      .eq("gateway_name", "stripe")
      .single();

    if (existingCustomer) {
      // Update existing customer
      const { error } = await supabase
        .from("billing_customers")
        .update({
          default_currency: customer.currency || "usd",
          billing_email: customer.email || "",
          metadata: {
            ...existingCustomer.metadata,
            stripe_customer_updated: true,
            stripe_metadata: customer.metadata || {}
          }
        })
        .eq("gateway_customer_id", customer.id)
        .eq("gateway_name", "stripe");

      if (error) {
        console.error("Error updating existing customer:", error);
        throw error;
      }
    } else {
      // Insert new customer
      const { error } = await supabase.from("billing_customers").insert({
        gateway_customer_id: customer.id,
        workspace_id: userId,
        gateway_name: "stripe",
        default_currency: customer.currency || "usd",
        billing_email: customer.email || "",
        metadata: customer.metadata || {}
      });

      if (error) {
        console.error("Error inserting new customer:", error);
        throw error;
      }
    }
  }

  console.log(`✅ Customer ${customer.id} synced for user ${userId}`);
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  // Helper function to safely convert Unix timestamp to ISO date string
  const safeTimestampToDate = (timestamp: number | null | undefined): string | null => {
    if (!timestamp || timestamp <= 0 || isNaN(timestamp)) return null;
    try {
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Invalid timestamp:", timestamp, error);
      return null;
    }
  };

  // Handle case where current_period_start might be invalid
  const currentPeriodStart = safeTimestampToDate(subscription.current_period_start);
  const currentPeriodEnd = safeTimestampToDate(subscription.current_period_end);

  // If dates are null, create proper start and end dates for monthly subscription
  let finalStartDate = currentPeriodStart;
  let finalEndDate = currentPeriodEnd;

  if (!finalStartDate || !finalEndDate) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    finalStartDate = finalStartDate || startDate.toISOString().split("T")[0];
    finalEndDate = finalEndDate || endDate.toISOString().split("T")[0];
  }

  const subscriptionData = {
    gateway_subscription_id: subscription.id,
    gateway_customer_id: subscription.customer as string,
    gateway_name: "stripe",
    gateway_product_id: subscription.items.data[0]?.price.product as string,
    gateway_price_id: subscription.items.data[0]?.price.id,
    status: subscription.status,
    current_period_start: finalStartDate,
    current_period_end: finalEndDate,
    currency: subscription.currency,
    is_trial: subscription.trial_end ? true : false,
    trial_ends_at: safeTimestampToDate(subscription.trial_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    quantity: subscription.items.data[0]?.quantity || 1
  };

  const { error } = await supabase
    .from("billing_subscriptions")
    .upsert(subscriptionData, {
      onConflict: "gateway_subscription_id,gateway_name"
    });

  if (error) {
    // If foreign key constraint fails due to missing product, wait and retry once
    if (error.code === "23503" && error.details?.includes("billing_products")) {
      console.warn("Product not found, retrying subscription sync after delay...", error.details);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { error: retryError } = await supabase
        .from("billing_subscriptions")
        .upsert(subscriptionData, {
          onConflict: "gateway_subscription_id,gateway_name"
        });

      if (retryError) {
        console.error("Error upserting subscription after retry:", retryError);
        throw retryError;
      }
    } else {
      console.error("Error upserting subscription:", error);
      throw error;
    }
  }

  console.log(`✅ Subscription ${subscription.id} synced`);
}

async function handleInvoiceEvent(invoice: Stripe.Invoice) {
  // Helper function to safely convert Unix timestamp to ISO date string
  const safeTimestampToDate = (timestamp: number | null): string | null => {
    if (!timestamp || timestamp <= 0) return null;
    try {
      return new Date(timestamp * 1000).toISOString().split("T")[0];
    } catch (error) {
      console.warn("Invalid timestamp:", timestamp);
      return null;
    }
  };

  const { error } = await supabase.from("billing_invoices").upsert({
    gateway_invoice_id: invoice.id,
    gateway_customer_id: invoice.customer as string,
    gateway_product_id: (invoice.lines.data[0]?.price?.product as string) || null,
    gateway_price_id: invoice.lines.data[0]?.price?.id || null,
    gateway_name: "stripe",
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status || "draft",
    due_date: safeTimestampToDate(invoice.due_date),
    paid_date: safeTimestampToDate(invoice.status_transitions?.paid_at || null),
    hosted_invoice_url: invoice.hosted_invoice_url
  });

  if (error) {
    console.error("Error upserting invoice:", error);
    throw error;
  }

  console.log(`✅ Invoice ${invoice.id} synced`);
}

async function handlePaymentIntentEvent(paymentIntent: Stripe.PaymentIntent) {
  // For now, just log payment intent events - charges will be tracked separately
  console.log(`🔔 Payment Intent ${paymentIntent.id} ${paymentIntent.status} - amount: ${paymentIntent.amount} ${paymentIntent.currency}`);
}

async function handleChargeEvent(charge: Stripe.Charge) {
  // Helper function to safely convert Unix timestamp to ISO date string
  const safeTimestampToDate = (timestamp: number | null): string | null => {
    if (!timestamp || timestamp <= 0) return null;
    try {
      return new Date(timestamp * 1000).toISOString();
    } catch (error) {
      console.warn("Invalid timestamp:", timestamp);
      return null;
    }
  };

  // Skip charges without customers (test data or standalone charges)
  if (!charge.customer) {
    console.log(`⏭️ Charge ${charge.id} skipped (no customer - likely test data)`);
    return;
  }

  const { error } = await supabase.from("billing_one_time_payments").upsert({
    gateway_charge_id: charge.id,
    gateway_customer_id: charge.customer as string,
    gateway_name: "stripe",
    amount: charge.amount,
    currency: charge.currency,
    status: charge.status,
    charge_date: safeTimestampToDate(charge.created),
    gateway_invoice_id: charge.invoice as string || null,
    gateway_product_id: null, // Would need to be derived from invoice line items
    gateway_price_id: null    // Would need to be derived from invoice line items
  });

  if (error) {
    console.error("Error upserting charge:", error);
    throw error;
  }

  console.log(`✅ Charge ${charge.id} synced`);
}
