/**
 * Stripe Product Creation Script
 *
 * This script creates the 3 NCAT billing products from scratch.
 * Use this if you DON'T have the products in your Stripe account yet.
 *
 * Creates:
 * 1. NCAT Free Plan - $0/month
 * 2. NCAT Pro Plan - $25/month
 * 3. NCAT Business Plan - $50/month
 *
 * Requirements:
 * - STRIPE_SECRET_KEY in .env.local
 * - Supabase Edge Functions running: npx supabase functions serve
 * - Stripe CLI forwarding webhooks: stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
 *
 * Usage:
 * npm run stripe:create-products
 */

import Stripe from "stripe";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config({ path: ".env.local" });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY not found in .env.local");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Supabase credentials not found in .env.local");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil"
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Product definitions - EXACT names from README
const PRODUCTS = [
  {
    name: "NCAT Free Plan",
    description: "Free tier with basic features for NCAT SaaS Dashboard",
    price: 0,
    tier: "free",
    storageQuotaGB: 10
  },
  {
    name: "NCAT Pro Plan",
    description: "Professional plan with advanced features",
    price: 25,
    tier: "pro",
    storageQuotaGB: 25
  },
  {
    name: "NCAT Business Plan",
    description: "Enterprise plan with full features",
    price: 50,
    tier: "business",
    storageQuotaGB: 50
  }
];

async function createStripeProducts() {
  console.log("\n🚀 Creating NCAT Stripe Products...\n");

  try {
    // Step 1: Check if products already exist
    console.log("🔍 Checking for existing NCAT products...");
    const existingProducts = await stripe.products.list({ limit: 100 });
    const ncatProducts = existingProducts.data.filter(
      (p) => p.name.toLowerCase().includes("ncat") && p.active
    );

    if (ncatProducts.length > 0) {
      console.log("\n⚠️  WARNING: Found existing NCAT products:");
      ncatProducts.forEach((p) => console.log(`   - ${p.name} (${p.id})`));
      console.log('\n💡 Use "npm run stripe:sync" instead to sync existing products.\n');
      console.log("Do you want to continue creating new products? (y/N)");

      // For automated scripts, exit here
      console.log('❌ Exiting to prevent duplicates. Run "npm run stripe:sync" instead.\n');
      return;
    }

    console.log("   ✅ No existing NCAT products found. Safe to create.\n");

    const createdProducts = [];

    // Step 2: Create each product with price
    for (const productDef of PRODUCTS) {
      console.log(`📦 Creating ${productDef.name}...`);

      try {
        // Create product
        const product = await stripe.products.create({
          name: productDef.name,
          description: productDef.description,
          metadata: {
            sync_to_app: "true",
            app_name: "ncat-saas"
          }
        });

        console.log(`   ✅ Product created: ${product.id}`);

        // Create price for the product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: productDef.price * 100, // Convert to cents
          currency: "usd",
          recurring: {
            interval: "month",
            interval_count: 1
          },
          metadata: {
            tier: productDef.tier,
            storage_quota_gb: productDef.storageQuotaGB.toString(),
            storage_quota_bytes: (productDef.storageQuotaGB * 1024 * 1024 * 1024).toString()
          }
        });

        console.log(
          `   ✅ Price created: ${price.id} - $${productDef.price}/month (${productDef.tier} tier, ${productDef.storageQuotaGB}GB storage)`
        );

        createdProducts.push({
          product,
          price,
          tier: productDef.tier
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error creating ${productDef.name}:`, errorMessage);
        throw error;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Products created: ${createdProducts.length}`);
    createdProducts.forEach(({ product, price, tier }) => {
      const amount = (price.unit_amount || 0) / 100;
      console.log(`   ✅ ${product.name} - $${amount}/month (${tier})`);
    });

    // Step 3: Wait for webhooks to sync to database
    console.log("\n⏳ Waiting for webhooks to sync data to database...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 4: Verify sync in database
    console.log("\n🔍 Verifying database sync...");

    const { data: dbProducts, error: productsError } = await supabase
      .from("billing_products")
      .select("gateway_product_id, name, description, active");

    if (productsError) {
      console.error("   ❌ Error fetching products from database:", productsError.message);
    } else {
      console.log(`   ✅ Products in database: ${dbProducts?.length || 0}`);
      dbProducts?.forEach((product) => {
        console.log(
          `      - ${product.name} (${product.gateway_product_id}) ${product.active ? "✓" : "✗"}`
        );
      });
    }

    const { data: dbPrices, error: pricesError } = await supabase
      .from("billing_prices")
      .select("gateway_price_id, amount, currency, recurring_interval, gateway_product_id, tier")
      .order("amount", { ascending: true });

    if (pricesError) {
      console.error("   ❌ Error fetching prices from database:", pricesError.message);
    } else {
      console.log(`\n   ✅ Prices in database: ${dbPrices?.length || 0}`);
      dbPrices?.forEach((price) => {
        const amount = (price.amount || 0) / 100;
        console.log(
          `      - $${amount}/${price.recurring_interval} - ${price.tier} tier (product: ${price.gateway_product_id})`
        );
      });
    }

    // Success summary
    console.log("\n✨ Products Created Successfully!\n");
    console.log("📌 Next Steps:");
    console.log("   1. Check Supabase Studio: http://localhost:54323");
    console.log("   2. Verify billing_products table has 3 NCAT products");
    console.log("   3. Verify billing_prices table has 3 prices");
    console.log("   4. Start development server: npm run dev");
    console.log("   5. Test user signup to verify free plan assignment\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n💥 Fatal Error:", errorMessage);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Ensure Edge Functions are running: npx supabase functions serve");
    console.error("   2. Ensure Stripe CLI is forwarding: stripe listen --forward-to ...");
    console.error("   3. Check webhook logs for errors: stripe logs tail");
    console.error("   4. Verify STRIPE_SECRET_KEY is set in .env.local\n");
    process.exit(1);
  }
}

// Run the creation
createStripeProducts().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
