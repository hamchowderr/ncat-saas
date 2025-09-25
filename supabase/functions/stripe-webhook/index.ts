// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@12.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2025-08-27.basil"
});

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
        await handleInvoiceEvent(receivedEvent.data.object as Stripe.Invoice);
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
  // Filter: Only sync products with specific metadata
  if (!product.metadata?.sync_to_app || product.metadata.sync_to_app !== "true") {
    console.log(`⏭️ Product ${product.id} skipped (not marked for sync)`);
    return;
  }

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
  // Filter: Only sync prices for products we care about
  if (!price.metadata?.sync_to_app || price.metadata.sync_to_app !== "true") {
    // Check if the parent product should be synced
    const { data: product } = await supabase
      .from("billing_products")
      .select("gateway_product_id")
      .eq("gateway_product_id", price.product as string)
      .single();

    if (!product) {
      console.log(`⏭️ Price ${price.id} skipped (product not synced)`);
      return;
    }
  }

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
    const { error } = await supabase.from("billing_customers").upsert({
      gateway_customer_id: customer.id,
      workspace_id: userId,
      gateway_name: "stripe",
      default_currency: customer.currency || "usd",
      billing_email: customer.email || "",
      metadata: customer.metadata || {}
    });

    if (error) {
      console.error("Error upserting customer:", error);
      throw error;
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

  // If both dates are null, use current date as fallback for start
  const fallbackDate = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("billing_subscriptions").upsert({
    gateway_subscription_id: subscription.id,
    gateway_customer_id: subscription.customer as string,
    gateway_name: "stripe",
    gateway_product_id: subscription.items.data[0]?.price.product as string,
    gateway_price_id: subscription.items.data[0]?.price.id,
    status: subscription.status,
    current_period_start: currentPeriodStart || fallbackDate,
    current_period_end: currentPeriodEnd || fallbackDate,
    currency: subscription.currency,
    is_trial: subscription.trial_end ? true : false,
    trial_ends_at: safeTimestampToDate(subscription.trial_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    quantity: subscription.items.data[0]?.quantity || 1
  });

  if (error) {
    console.error("Error upserting subscription:", error);
    throw error;
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
