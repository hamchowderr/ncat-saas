import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceRoleClient } from "@/lib/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil"
});

// Dynamic free plan configuration - no hardcoded IDs!

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from("billing_subscriptions")
      .select("gateway_subscription_id")
      .eq("gateway_customer_id", user.id)
      .eq("gateway_name", "stripe")
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      return NextResponse.json({
        message: "User already has an active subscription",
        subscriptionId: existingSubscription.gateway_subscription_id
      });
    }

    // Find or create Stripe customer
    let { data: customer, error: customerError } = await supabase
      .from("billing_customers")
      .select("gateway_customer_id")
      .eq("workspace_id", user.id)
      .eq("gateway_name", "stripe")
      .single();

    if (customerError || !customer || customer.gateway_customer_id.startsWith("pending_")) {
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          workspace_id: user.id
        }
      });

      // Save to database using service role client
      const serviceClient = createServiceRoleClient();
      const { data: newCustomer, error: createError } = await serviceClient
        .from("billing_customers")
        .upsert(
          {
            gateway_customer_id: stripeCustomer.id,
            workspace_id: user.id,
            gateway_name: "stripe",
            billing_email: user.email || "",
            default_currency: "usd",
            metadata: {
              status: "active",
              updated_at: new Date().toISOString()
            }
          },
          {
            onConflict: "workspace_id,gateway_name"
          }
        )
        .select("gateway_customer_id")
        .single();

      if (createError) {
        console.error("Error creating billing customer:", createError);
        return NextResponse.json(
          {
            error: "Failed to create billing customer"
          },
          { status: 500 }
        );
      }

      customer = newCustomer;
    }

    // Get the free plan price dynamically from database
    const { data: freePlan, error: freePlanError } = await supabase
      .from("billing_prices")
      .select("gateway_price_id, gateway_product_id")
      .eq("amount", 0)  // Free plan has $0 amount
      .eq("gateway_name", "stripe")
      .eq("active", true)
      .single();

    if (freePlanError || !freePlan) {
      console.error("No free plan found in database:", freePlanError);
      return NextResponse.json(
        { error: "Free plan not available. Please contact support." },
        { status: 500 }
      );
    }

    // Create free subscription with dynamic price ID
    const subscription = await stripe.subscriptions.create({
      customer: customer.gateway_customer_id,
      items: [
        {
          price: freePlan.gateway_price_id,  // Dynamic price ID from database
          quantity: 1
        }
      ],
      metadata: {
        user_id: user.id,
        workspace_id: user.id,
        plan_type: "free"
      }
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.gateway_customer_id,
      message: "Free subscription created successfully"
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
