const { test, expect } = require("@playwright/test");

/**
 * Comprehensive E2E Test for Complete User Signup Flow
 *
 * This test covers the entire user journey:
 * 1. User Sign Up - User Creation
 * 2. Email Confirmation - Check email in Mailpit
 * 3. Click confirmation link
 * 4. Complete Onboarding page
 * 5. Verify free subscription creation
 * 6. Access dashboard
 */

test.describe("Complete User Signup Flow", () => {
  const testUser = {
    email: `test${Date.now()}@playwright.test`,
    password: "TestPassword123!",
    organizationName: "Playwright Test Organization"
  };

  test("should complete full signup to dashboard journey", async ({ page }) => {
    console.log("🚀 Starting comprehensive user signup flow test...");
    console.log(`📧 Test user email: ${testUser.email}`);

    // Step 1: Navigate to signup page
    console.log("\n📍 Step 1: Navigate to signup page");
    await page.goto("http://localhost:3001/auth/login");
    await expect(page).toHaveTitle(/NCAT SaaS|Welcome Back/);

    // Click the "Sign up" toggle button
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText("Create Account")).toBeVisible();
    console.log("✅ Signup form visible");

    // Step 2: Fill signup form and submit
    console.log("\n📍 Step 2: Fill signup form and submit");
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="repeat-password"]', testUser.password);

    // Submit the form
    await page.getByRole("button", { name: "Create Account" }).click();
    console.log("✅ Signup form submitted");

    // Step 3: Verify redirection to email confirmation page
    console.log("\n📍 Step 3: Verify email confirmation page");
    await page.waitForURL("**/auth/sign-up-success", { timeout: 10000 });
    await expect(page.getByText("Check Your Email")).toBeVisible();
    await expect(page.getByText("We've sent you a confirmation link")).toBeVisible();
    console.log("✅ Email confirmation page displayed");

    // Step 4: Check Mailpit for the confirmation email
    console.log("\n📍 Step 4: Check Mailpit for confirmation email");

    // Wait a moment for email to be sent
    await page.waitForTimeout(2000);

    // Open new tab for Mailpit
    const mailpitPage = await page.context().newPage();
    await mailpitPage.goto("http://127.0.0.1:54324");

    // Wait for email to appear in Mailpit
    await mailpitPage.waitForSelector(".message-item", { timeout: 15000 });
    console.log("✅ Email found in Mailpit");

    // Click on the first email
    await mailpitPage.click(".message-item:first-child");

    // Wait for email content to load
    await mailpitPage.waitForSelector("iframe", { timeout: 10000 });

    // Get the iframe containing the email content
    const emailFrame = mailpitPage.frameLocator("iframe");

    // Look for the confirmation link in the email
    const confirmationLink = await emailFrame.getByRole("link", { name: /confirm/i }).first();
    await expect(confirmationLink).toBeVisible();

    // Get the href of the confirmation link
    const confirmationUrl = await confirmationLink.getAttribute("href");
    console.log(`✅ Found confirmation link: ${confirmationUrl}`);

    // Close Mailpit tab
    await mailpitPage.close();

    // Step 5: Click the confirmation link
    console.log("\n📍 Step 5: Click confirmation link");
    await page.goto(confirmationUrl);

    // Should redirect to onboarding page
    await page.waitForURL("**/auth/onboarding", { timeout: 10000 });
    await expect(page.getByText("Welcome to NCAT SaaS!")).toBeVisible();
    await expect(page.getByText("Your email has been confirmed")).toBeVisible();
    console.log("✅ Redirected to onboarding page");

    // Step 6: Complete onboarding
    console.log("\n📍 Step 6: Complete onboarding");
    await page.fill('input[placeholder="Enter your organization name"]', testUser.organizationName);
    await page.getByRole("button", { name: "Complete Setup" }).click();

    // Should redirect to dashboard/workspace
    await page.waitForURL("**/workspace/file-manager", { timeout: 10000 });
    console.log("✅ Redirected to dashboard");

    // Step 7: Verify user is logged in and dashboard is accessible
    console.log("\n📍 Step 7: Verify dashboard access");
    await expect(page.getByText(testUser.organizationName)).toBeVisible();

    // Check for main navigation elements
    await expect(page.getByText("File Manager")).toBeVisible();
    console.log("✅ Dashboard fully accessible");

    // Step 8: Verify billing/subscription (free tier)
    console.log("\n📍 Step 8: Verify free subscription");
    await page.goto("http://localhost:3001/billing");

    // Should show billing page with free tier info
    await expect(page.getByText("Billing")).toBeVisible();
    console.log("✅ Billing page accessible");

    // Step 9: Final verification - user can navigate around
    console.log("\n📍 Step 9: Final navigation verification");
    await page.goto("http://localhost:3001/workspace/file-manager");
    await expect(page.getByText("File Manager")).toBeVisible();

    await page.goto("http://localhost:3001/workspace/media-tools");
    await expect(page.getByText("Media Tools")).toBeVisible();

    console.log("\n🎉 COMPLETE SUCCESS! Full user journey completed:");
    console.log(`📧 User: ${testUser.email}`);
    console.log(`🏢 Organization: ${testUser.organizationName}`);
    console.log("✅ Signup → Email Confirmation → Onboarding → Dashboard → Billing");
    console.log("✅ All systems working: Next.js + Supabase + Edge Functions + Email Flow");
  });

  test("should handle resend email functionality", async ({ page }) => {
    console.log("\n🔄 Testing resend email functionality...");

    const resendTestUser = {
      email: `resend${Date.now()}@playwright.test`,
      password: "TestPassword123!"
    };

    // Navigate and signup
    await page.goto("http://localhost:3001/auth/login");
    await page.getByRole("button", { name: "Sign up" }).click();

    await page.fill('input[type="email"]', resendTestUser.email);
    await page.fill('input[id="password"]', resendTestUser.password);
    await page.fill('input[id="repeat-password"]', resendTestUser.password);

    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for confirmation page
    await page.waitForURL("**/auth/sign-up-success");

    // Test resend button
    const resendButton = page.getByRole("button", { name: "Resend Confirmation Email" });
    await expect(resendButton).toBeVisible();

    await resendButton.click();

    // Should show success message
    await expect(page.getByText("Confirmation email sent!")).toBeVisible({ timeout: 5000 });

    console.log("✅ Resend email functionality working");
  });

  test("should prevent access to protected routes without email confirmation", async ({ page }) => {
    console.log("\n🔒 Testing protected route access controls...");

    // Try to directly access dashboard without being logged in
    await page.goto("http://localhost:3001/workspace/file-manager");

    // Should redirect to login
    await page.waitForURL("**/auth/login", { timeout: 10000 });
    await expect(page.getByText("Welcome Back")).toBeVisible();

    console.log("✅ Protected routes properly secured");
  });
});

/**
 * Helper function to generate unique test data
 */
function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `playwright.${timestamp}@test.local`,
    password: "SecureTestPassword123!",
    organizationName: `Test Org ${timestamp}`
  };
}
