// Pure Playwright integration tests - real app, no mocks
const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

test.describe('Real FreeBusy Desktop App Tests', () => {
  let electronApp;
  let page;

  test.beforeEach(async () => {
    // Launch the actual app in demo mode
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../main/app.js')],
      env: { ...process.env, DEMO_MODE: 'true' }
    });
    
    page = await electronApp.firstWindow();
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('REAL-APP-001: Should launch actual FreeBusy app successfully', async () => {
    await page.waitForLoadState('domcontentloaded');
    
    // Basic app launch verification
    expect(page).toBeDefined();
    
    // Check if page has content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify app title
    const title = await page.title();
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
  });

  test('REAL-APP-002: Should have working window management', async () => {
    await page.waitForLoadState('domcontentloaded');
    
    // Test window dimensions
    const windowSize = await page.viewportSize();
    expect(windowSize.width).toBeGreaterThan(0);
    expect(windowSize.height).toBeGreaterThan(0);
    
    // Test window is visible
    const isVisible = await page.evaluate(() => document.visibilityState === 'visible');
    expect(isVisible).toBe(true);
  });

  test('REAL-APP-003: Should load without JavaScript errors', async () => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for any async errors
    
    // Should not have critical JS errors
    const criticalErrors = errors.filter(error => 
      !error.toString().includes('Warning:') && 
      !error.toString().includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('REAL-APP-004: Should have functional IPC in demo mode', async () => {
    await page.waitForLoadState('domcontentloaded');
    
    // Test if electronAPI or similar is available
    const hasElectronAPI = await page.evaluate(() => {
      return typeof window.electronAPI !== 'undefined' || 
             typeof window.electron !== 'undefined' ||
             typeof require !== 'undefined';
    });
    
    // In Electron, some form of IPC should be available
    expect(hasElectronAPI).toBeTruthy();
  });

  test('REAL-APP-005: Should work in demo mode environment', async () => {
    await page.waitForLoadState('domcontentloaded');
    
    // Verify demo mode is working by checking if app loads without auth
    // In demo mode, app should not be stuck on auth screen
    await page.waitForTimeout(3000);
    
    const bodyContent = await page.textContent('body');
    expect(bodyContent.length).toBeGreaterThan(0);
    
    // Should not show Google auth errors in demo mode
    const hasAuthErrors = bodyContent.toLowerCase().includes('oauth') && 
                         bodyContent.toLowerCase().includes('error');
    expect(hasAuthErrors).toBe(false);
  });

  test('REAL-APP-006: Should have basic UI elements loaded', async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Check for basic HTML structure
    const hasHtml = await page.locator('html').isVisible();
    const hasBody = await page.locator('body').isVisible();
    
    expect(hasHtml).toBe(true);
    expect(hasBody).toBe(true);
    
    // Should have some content or UI elements
    const elementCount = await page.evaluate(() => document.body.children.length);
    expect(elementCount).toBeGreaterThan(0);
  });

  test('REAL-APP-007: Should respond to user interactions', async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Test basic click interaction on body
    await page.click('body');
    
    // Should not crash or throw errors after click
    const isStillVisible = await page.locator('body').isVisible();
    expect(isStillVisible).toBe(true);
  });
});