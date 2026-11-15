/**
 * Stripe Setup Checker
 *
 * This script verifies that all required services are running before syncing Stripe products.
 * Run this before executing npm run stripe:sync
 *
 * Usage:
 * npm run stripe:check
 */

import * as dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: ".env.local" });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSetup() {
  console.log("\n🔍 Checking Stripe Sync Setup...\n");

  let allGood = true;

  // Check 1: Environment Variables
  console.log("1️⃣  Checking environment variables...");
  if (!STRIPE_SECRET_KEY) {
    console.log("   ❌ STRIPE_SECRET_KEY not found in .env.local");
    allGood = false;
  } else {
    console.log("   ✅ STRIPE_SECRET_KEY configured");
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log("   ❌ Supabase credentials not found in .env.local");
    allGood = false;
  } else {
    console.log("   ✅ Supabase credentials configured");
  }
  console.log("");

  // Check 2: Supabase Status
  console.log("2️⃣  Checking Supabase services...");
  try {
    const { stdout } = await execAsync("npx supabase status");
    if (stdout.includes("API URL")) {
      console.log("   ✅ Supabase is running");

      // Extract and show API URL
      const apiUrlMatch = stdout.match(/API URL: (.+)/);
      if (apiUrlMatch) {
        console.log(`      API URL: ${apiUrlMatch[1]}`);
      }
    } else {
      console.log("   ❌ Supabase status unclear");
      allGood = false;
    }
  } catch (error) {
    console.log("   ❌ Supabase is not running");
    console.log("      Run: npx supabase start");
    allGood = false;
  }
  console.log("");

  // Check 3: Edge Functions
  console.log("3️⃣  Checking Edge Functions...");
  try {
    const response = await fetch("http://127.0.0.1:54321/functions/v1/stripe-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ping" })
    });

    // Edge function responding (even with error) means it's running
    if (response.status === 400 || response.status === 401) {
      console.log("   ✅ Edge Functions are running");
      console.log("      URL: http://127.0.0.1:54321/functions/v1/stripe-webhook");
    } else {
      console.log(`   ⚠️  Edge Functions responded with status ${response.status}`);
      console.log("      This might be okay, but check the logs.");
    }
  } catch (error) {
    console.log("   ❌ Edge Functions not responding");
    console.log("      Run: npx supabase functions serve");
    allGood = false;
  }
  console.log("");

  // Check 4: Stripe CLI
  console.log("4️⃣  Checking Stripe CLI...");
  try {
    const { stdout } = await execAsync("stripe --version");
    if (stdout.includes("stripe version")) {
      console.log("   ✅ Stripe CLI is installed");

      // Show webhook forwarding instructions
      console.log("\n   📋 To forward webhooks, run:");
      console.log(
        "      stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook"
      );
      console.log("\n   ⚠️  Make sure this command is running in a separate terminal!");
    }
  } catch (error) {
    console.log("   ❌ Stripe CLI not installed");
    console.log("      Install from: https://stripe.com/docs/stripe-cli");
    allGood = false;
  }
  console.log("");

  // Final Summary
  if (allGood) {
    console.log("✨ All checks passed!\n");
    console.log("📌 Next Steps:");
    console.log("   1. Make sure Stripe CLI is forwarding webhooks (see command above)");
    console.log("   2. Run the sync script: npm run stripe:sync\n");
  } else {
    console.log("❌ Setup incomplete. Please fix the issues above.\n");
    process.exit(1);
  }
}

checkSetup().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
