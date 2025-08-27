const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory - only real app tests
  testDir: './test-cases/playwright-tests',
  testMatch: ['**/real-app.test.js'],
  
  // Global timeout
  globalTimeout: 60000,
  
  // Test timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000
  },
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-html-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['line']
  ],
  
  // Shared settings
  use: {
    // Base URL for web tests
    // baseURL: 'http://127.0.0.1:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure'
  },
  
  // Configure projects for different environments
  projects: [
    {
      name: 'electron-tests',
      testMatch: '**/*.test.js',
      use: {
        // Electron-specific configuration
        // Note: Electron tests don't use browser contexts
      }
    }
  ],
  
  // Run local dev server before starting tests
  webServer: undefined, // Not needed for Electron tests
  
  // Output directory
  outputDir: 'test-results/',
});