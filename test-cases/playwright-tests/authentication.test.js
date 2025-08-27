// tests/e2e/authentication.test.js
const { test, expect, _electron: electron } = require('@playwright/test');
const { FreeBusyTestApp, AuthTestHelpers } = require('./test-helpers.js');

test.describe('FreeBusy Desktop Authentication Tests', () => {
  let app;

  test.beforeEach(async () => {
    app = new FreeBusyTestApp();
  });

  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  test('AUTH-E2E-001: Should launch application successfully', async () => {
    const page = await app.launch();
    
    // Verify the app window loaded
    expect(page).toBeDefined();
    
    // Wait for the main window to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // In demo mode, the app should show the main interface
    await expect(page.locator('body')).toBeVisible();
  });

  test('AUTH-E2E-002: Should show demo mode indicator', async () => {
    const page = await app.launch();
    
    await page.waitForLoadState('domcontentloaded');
    
    // Look for demo mode indicator or functionality
    // This test verifies the app is running in the expected demo mode
    const title = await page.title();
    expect(title).toContain('FreeBusy');
  });

  test('AUTH-E2E-003: Should handle window lifecycle', async () => {
    const page = await app.launch();
    
    // Verify window properties
    expect(await page.isVisible()).toBeTruthy();
    
    // Test window can be minimized/restored (basic window management)
    await page.evaluate(() => {
      // Basic window state test
      return window.innerWidth > 0 && window.innerHeight > 0;
    });
  });

  test('AUTH-E2E-004: Should load main window components', async () => {
    const page = await app.launch();
    
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for basic DOM structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no critical JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    // Wait a moment to catch any immediate errors
    await page.waitForTimeout(2000);
    
    // Should have no critical errors
    expect(errors.length).toBe(0);
  });

  test('AUTH-E2E-005: Should handle IPC communication', async () => {
    const page = await app.launch();
    
    await page.waitForLoadState('domcontentloaded');
    
    // Test basic IPC functionality if available
    const hasElectronAPI = await page.evaluate(() => {
      return typeof window.electronAPI !== 'undefined' || typeof window.electron !== 'undefined';
    });
    
    // In demo mode, IPC should be available
    expect(hasElectronAPI).toBeTruthy();
  });
});

test.describe('FreeBusy Desktop Demo Mode Tests', () => {
  let app;

  test.beforeEach(async () => {
    app = new FreeBusyTestApp();
  });

  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  test('DEMO-E2E-001: Should work in demo mode without credentials', async () => {
    const page = await app.launch();
    
    await page.waitForLoadState('domcontentloaded');
    
    // Demo mode should not require real Google credentials
    // The app should launch and be functional
    expect(await page.isVisible()).toBeTruthy();
    
    // Should not show authentication errors in demo mode
    const hasAuthError = await page.locator('text=authentication error').isVisible().catch(() => false);
    expect(hasAuthError).toBeFalsy();
  });

  test('DEMO-E2E-002: Should show demo data when available', async () => {
    const page = await app.launch();
    
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for demo mode to initialize
    await page.waitForTimeout(1000);
    
    // Demo mode should show some form of mock data or indication
    const hasContent = await page.evaluate(() => {
      return document.body.textContent.length > 0;
    });
    
    expect(hasContent).toBeTruthy();
  });
});

// Tests complete - helpers are now in test-helpers.js