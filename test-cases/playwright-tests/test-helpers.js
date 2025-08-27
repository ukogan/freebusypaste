// Shared test helpers for Playwright tests
const { _electron: electron } = require('@playwright/test');
const path = require('path');

class FreeBusyTestApp {
  constructor() {
    this.electronApp = null;
    this.mainWindow = null;
  }

  async launch() {
    // Launch Electron app in demo mode
    this.electronApp = await electron.launch({
      args: [path.join(__dirname, '../../main/app.js')],
      env: { ...process.env, DEMO_MODE: 'true' }
    });
    
    this.mainWindow = await this.electronApp.firstWindow();
    return this.mainWindow;
  }

  async close() {
    if (this.electronApp) {
      await this.electronApp.close();
    }
  }

  async waitForSelector(selector, options = {}) {
    return await this.mainWindow.waitForSelector(selector, { timeout: 5000, ...options });
  }

  async clickButton(text) {
    return await this.mainWindow.click(`button:has-text("${text}")`);
  }

  async expectVisible(selector) {
    const { expect } = require('@playwright/test');
    await expect(this.mainWindow.locator(selector)).toBeVisible({ timeout: 5000 });
  }

  async expectText(selector, text) {
    const { expect } = require('@playwright/test');
    await expect(this.mainWindow.locator(selector)).toContainText(text);
  }
}

class AuthTestHelpers {
  static async waitForElement(page, selector, timeout = 5000) {
    return await page.waitForSelector(selector, { timeout });
  }

  static async clickAndWait(page, selector, waitForSelector = null, timeout = 3000) {
    await page.click(selector);
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout });
    } else {
      await page.waitForTimeout(500); // Brief pause for UI updates
    }
  }

  static async verifyNoErrors(page) {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(new Error(msg.text()));
      }
    });
    
    // Wait for any async errors
    await page.waitForTimeout(1000);
    return errors;
  }

  static async getWindowState(page) {
    return await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      visible: document.visibilityState === 'visible',
      focused: document.hasFocus()
    }));
  }
}

module.exports = { FreeBusyTestApp, AuthTestHelpers };