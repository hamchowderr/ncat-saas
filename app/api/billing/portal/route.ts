import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceRoleClient } from "@/lib/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil"
});

export async function POST(req: NextRequest) {
  try {
    const { customerId, returnUrl } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/billing`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    // Find the existing billing customer for this user using service role to bypass RLS
    const serviceClient = createServiceRoleClient();
    const { data: customer, error: customerError } = await serviceClient
      .from("billing_customers")
      .select("gateway_customer_id")
      .eq("workspace_id", user.id)
      .eq("gateway_name", "stripe")
      .single();

    // Check if customer exists and has a valid Stripe customer ID
    if (customerError || !customer || !customer.gateway_customer_id.startsWith("cus_")) {
      console.error("No valid Stripe customer found for user:", {
        userId: user.id,
        email: user.email,
        customerError: customerError?.message,
        customer: customer?.gateway_customer_id
      });

      return NextResponse.json(
        {
          error: "Billing account not found. Please contact support.",
          debug: "Customer should have been created during onboarding"
        },
        { status: 404 }
      );
    }

    // Create a billing portal session with the existing customer
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.gateway_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
}
