const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for NCAT SaaS E2E Tests
 * 
 * This configuration is optimized for testing the complete user signup flow
 * including email confirmation and onboarding processes.
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // Global test timeout (30 seconds for comprehensive flows)
  timeout: 30 * 1000,
  
  expect: {
    // Timeout for assertions
    timeout: 10 * 1000,
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3001',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Global setup and teardown (commented out for now)
  // globalSetup: require.resolve('./tests/global-setup.js'),
  
  // Web server configuration (servers already running manually)
  // webServer: [
  //   {
  //     command: 'npm run dev',
  //     port: 3001,
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120 * 1000,
  //   },
  // ],
});