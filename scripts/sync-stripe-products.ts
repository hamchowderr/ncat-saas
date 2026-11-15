/**
 * Stripe Product Sync Script
 *
 * This script syncs existing Stripe products to your Supabase database.
 * It adds the necessary metadata to products and prices, then triggers
 * webhooks to populate the billing_products and billing_prices tables.
 *
 * Requirements:
 * - STRIPE_SECRET_KEY in .env.local
 * - Supabase Edge Functions running: npx supabase functions serve
 * - Stripe CLI forwarding webhooks: stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
 *
 * Usage:
 * npm run stripe:sync
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

// Product names to sync (case-insensitive matching)
const NCAT_PRODUCT_NAMES = ["NCAT Free Plan", "NCAT Pro Plan", "NCAT Business Plan"];

// Tier detection based on price amount (in cents)
const detectTier = (unitAmount: number | null): string => {
  if (unitAmount === 0) return "free";
  if (unitAmount === 2500) return "pro";
  if (unitAmount === 5000) return "business";
  return "unknown";
};

async function syncStripeProducts() {
  console.log("\n🚀 Starting Stripe Product Sync...\n");

  try {
    // Step 1: List all products from Stripe
    console.log("📋 Fetching products from Stripe...");
    const products = await stripe.products.list({ limit: 100 });
    console.log(`   Found ${products.data.length} total products\n`);

    // Step 2: Filter to NCAT products (only active ones with sync metadata)
    const ncatProducts = products.data.filter((product) => {
      const nameMatch = NCAT_PRODUCT_NAMES.some((name) =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
      // Only include active products OR products that already have sync metadata
      const shouldSync = product.active || product.metadata?.sync_to_app === "true";
      return nameMatch && shouldSync;
    });

    if (ncatProducts.length === 0) {
      console.log("⚠️  No NCAT products found. Product names should contain:");
      NCAT_PRODUCT_NAMES.forEach((name) => console.log(`   - ${name}`));
      console.log("\n💡 Tip: Check your Stripe Dashboard for product names.");
      return;
    }

    // Check for duplicate product names
    const productNames = ncatProducts.map((p) => p.name);
    const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.log("⚠️  WARNING: Duplicate product names detected:");
      duplicates.forEach((name) => {
        const dupes = ncatProducts.filter((p) => p.name === name);
        dupes.forEach((p) =>
          console.log(`   - ${name} (${p.id}) - ${p.active ? "Active" : "Inactive"}`)
        );
      });
      console.log("\n💡 Tip: Deactivate or archive duplicate products in Stripe Dashboard.\n");
    }

    console.log(`✅ Found ${ncatProducts.length} NCAT products to sync:`);
    ncatProducts.forEach((product) => {
      const status = product.active ? "✓ Active" : "✗ Inactive";
      console.log(`   - ${product.name} (${product.id}) - ${status}`);
    });
    console.log("");

    // Step 3: Update product metadata and trigger webhooks
    console.log("🔄 Syncing products to database (triggering webhooks)...");
    for (const product of ncatProducts) {
      try {
        // Always update metadata to trigger webhook (even if it already exists)
        // This ensures the webhook fires and syncs to the database
        await stripe.products.update(product.id, {
          metadata: {
            sync_to_app: "true",
            app_name: "ncat-saas",
            last_sync: new Date().toISOString() // Add timestamp to ensure update always happens
          }
        });
        console.log(`   ✅ ${product.name} - Webhook triggered for sync`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ ${product.name} - Error: ${errorMessage}`);
      }
    }
    console.log("");

    // Step 4: Fetch and update prices
    console.log("💰 Processing prices for synced products...");
    let totalPrices = 0;

    for (const product of ncatProducts) {
      try {
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 10
        });

        for (const price of prices.data) {
          totalPrices++;

          // Detect tier from price amount
          const tier = detectTier(price.unit_amount);

          // Always update metadata to trigger webhook (even if it already exists)
          await stripe.prices.update(price.id, {
            metadata: {
              tier: tier,
              last_sync: new Date().toISOString() // Add timestamp to ensure update always happens
            }
          });
          console.log(
            `   ✅ ${product.name} - $${(price.unit_amount || 0) / 100}/month (tier: ${tier}) - Webhook triggered`
          );

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ ${product.name} - Error fetching prices: ${errorMessage}`);
      }
    }
    console.log(`\n📊 Processed ${totalPrices} prices total\n`);

    // Step 5: Wait for webhooks to process
    console.log("\n⏳ Waiting for webhooks to sync data to database...");
    console.log("   (This requires Edge Functions and Stripe CLI to be running)");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased wait time for webhook processing

    // Step 6: Verify sync in database
    console.log("\n🔍 Verifying database sync...");

    const { data: dbProducts, error: productsError } = await supabase
      .from("billing_products")
      .select("gateway_product_id, name, description, active");

    let productCount = 0;

    if (productsError) {
      console.error("   ❌ Error fetching products from database:", productsError.message);
    } else {
      productCount = dbProducts?.length || 0;
      console.log(`   ✅ Products in database: ${productCount}`);

      if (productCount === 0) {
        console.log("\n   ⚠️  WARNING: No products synced to database!");
        console.log("   📋 Troubleshooting checklist:");
        console.log("      1. Is Supabase running? Check: npx supabase status");
        console.log("      2. Are Edge Functions running? Run: npx supabase functions serve");
        console.log(
          "      3. Is Stripe CLI forwarding? Run: stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook"
        );
        console.log("      4. Check Stripe webhook logs: stripe logs tail");
        console.log(
          "      5. Check Edge Function logs in the terminal running 'npx supabase functions serve'\n"
        );
      } else {
        dbProducts?.forEach((product) => {
          console.log(
            `      - ${product.name} (${product.gateway_product_id}) ${product.active ? "✓" : "✗"}`
          );
        });
      }
    }

    const { data: dbPrices, error: pricesError } = await supabase
      .from("billing_prices")
      .select("gateway_price_id, amount, currency, recurring_interval, gateway_product_id, tier")
      .order("amount", { ascending: true });

    if (pricesError) {
      console.error("   ❌ Error fetching prices from database:", pricesError.message);
    } else {
      const priceCount = dbPrices?.length || 0;
      console.log(`\n   ✅ Prices in database: ${priceCount}`);

      if (priceCount === 0 && productCount > 0) {
        console.log("\n   ⚠️  WARNING: Products synced but no prices!");
        console.log("      This is unusual - prices should sync after products.");
        console.log("      Check Edge Function logs for errors.\n");
      } else if (priceCount > 0) {
        dbPrices?.forEach((price) => {
          const amount = (price.amount || 0) / 100;
          console.log(
            `      - $${amount}/${price.recurring_interval} - ${price.tier} tier (product: ${price.gateway_product_id})`
          );
        });
      }
    }

    // Success summary
    console.log("\n✨ Sync Complete!\n");
    console.log("📌 Next Steps:");
    console.log("   1. Check Supabase Studio: http://localhost:54323");
    console.log("   2. Verify billing_products table has 3 NCAT products");
    console.log("   3. Verify billing_prices table has 3 prices");
    console.log("   4. Start development server: npm run dev\n");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("\n💥 Fatal Error:", errorMessage);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Ensure Edge Functions are running: npx supabase functions serve");
    console.error("   2. Ensure Stripe CLI is forwarding: stripe listen --forward-to ...");
    console.error("   3. Check webhook logs for errors: stripe logs tail\n");
    process.exit(1);
  }
}

// Run the sync
syncStripeProducts().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
