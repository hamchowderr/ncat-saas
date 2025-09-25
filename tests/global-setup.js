const { chromium } = require("@playwright/test");

/**
 * Global Setup for NCAT SaaS E2E Tests
 *
 * This setup ensures all required services are running before tests begin:
 * - Next.js development server (port 3001)
 * - Supabase local instance (port 54321)
 * - Mailpit email testing (port 54324)
 * - Edge Functions (Supabase Functions)
 */
async function globalSetup() {
  console.log("\n🔧 Global Setup: Initializing test environment...");

  // Create a browser instance for health checks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if Next.js is running
    console.log("⚙️ Checking Next.js server...");
    await page.goto("http://localhost:3001", { timeout: 10000 });
    console.log("✅ Next.js server is running on port 3001");

    // Check if Supabase is running
    console.log("⚙️ Checking Supabase API...");
    const supabaseResponse = await page.request.get("http://127.0.0.1:54321/rest/v1/", {
      timeout: 5000
    });
    if (supabaseResponse.ok()) {
      console.log("✅ Supabase API is running on port 54321");
    } else {
      throw new Error("Supabase API is not responding");
    }

    // Check if Mailpit is running
    console.log("⚙️ Checking Mailpit email service...");
    const mailpitResponse = await page.request.get("http://127.0.0.1:54324/api/v1/messages", {
      timeout: 5000
    });
    if (mailpitResponse.ok()) {
      console.log("✅ Mailpit is running on port 54324");
    } else {
      throw new Error("Mailpit is not responding");
    }

    // Check if Edge Functions are running
    console.log("⚙️ Checking Supabase Edge Functions...");
    const functionsResponse = await page.request.get(
      "http://127.0.0.1:54321/functions/v1/_internal/health",
      {
        timeout: 5000
      }
    );
    if (functionsResponse.ok()) {
      console.log("✅ Supabase Edge Functions are running");
    } else {
      console.log("⚠️ Warning: Edge Functions health check failed, but continuing...");
    }

    console.log("\n🚀 All services ready! Starting tests...");
  } catch (error) {
    console.error("\n❌ Global Setup Failed:", error.message);
    console.error("\nPlease ensure all required services are running:");
    console.error("1. npm run dev (Next.js on port 3001)");
    console.error("2. npx supabase start (Supabase services)");
    console.error("3. npx supabase functions serve (Edge Functions)");
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
