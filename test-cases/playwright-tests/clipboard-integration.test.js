// tests/e2e/clipboard-integration.test.js
const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');
const { FreeBusyTestApp } = require('./test-helpers.js');

class ClipboardTestHelpers {
  static async setupClipboardAccess(page) {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Mock clipboard API for testing
    await page.addInitScript(() => {
      window.mockClipboard = {
        content: '',
        writeText: async (text) => {
          window.mockClipboard.content = text;
          return Promise.resolve();
        },
        readText: async () => {
          return Promise.resolve(window.mockClipboard.content);
        }
      };
      
      // Override navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: window.mockClipboard,
        writable: false
      });
    });
  }

  static getExpectedClipboardFormat(testData) {
    const { dates, timeSlots, meetingInfo } = testData;
    
    let expectedFormat = `Available Times - ${dates.join(', ')}\n\n`;
    
    // Add time table
    expectedFormat += 'Time        ';
    dates.forEach(date => {
      expectedFormat += `${date}        `;
    });
    expectedFormat += '\n';
    
    timeSlots.forEach(time => {
      expectedFormat += `${time}     `;
      dates.forEach((date, index) => {
        const isAvailable = testData.availability[date] && testData.availability[date][time];
        expectedFormat += isAvailable ? '[BOOK]      ' : '—           ';
      });
      expectedFormat += '\n';
    });
    
    // Add meeting info
    expectedFormat += '\n';
    expectedFormat += `Meeting: ${meetingInfo.title}\n`;
    expectedFormat += `Zoom: ${meetingInfo.zoomLink}\n`;
    expectedFormat += `Contact: ${meetingInfo.email}\n`;
    
    return expectedFormat;
  }

  static async verifyClipboardContent(page, expectedPattern) {
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toMatch(expectedPattern);
    return clipboardContent;
  }

  static createTestAvailabilityData() {
    return {
      dates: ['Wed 8/27', 'Thu 8/28', 'Fri 8/29'],
      timeSlots: ['9:00', '9:30', '10:00', '10:30', '11:00'],
      availability: {
        'Wed 8/27': {
          '9:00': true, '9:30': true, '10:00': false, '10:30': true, '11:00': true
        },
        'Thu 8/28': {
          '9:00': true, '9:30': false, '10:00': true, '10:30': true, '11:00': true
        },
        'Fri 8/29': {
          '9:00': true, '9:30': true, '10:00': true, '10:30': false, '11:00': true
        }
      },
      meetingInfo: {
        title: 'Meeting with Uri',
        zoomLink: 'https://rzero.zoom.us/j/5152335657',
        email: 'ukogan@rzero.com'
      }
    };
  }
}

test.describe('Clipboard Integration - Core Functionality', () => {
  let app, electronApp, page;
  
  test.beforeEach(async () => {
    const setup = await AvailabilityTestHelpers.setupAuthenticatedApp();
    app = setup.app;
    electronApp = setup.electronApp;
    page = setup.page;
    
    await ClipboardTestHelpers.setupClipboardAccess(page);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('CLIP-001: Automatic clipboard copy after generation', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Configure meeting details for predictable output
    await page.evaluate(() => {
      window.electronAPI.setUserSettings({
        personal: {
          email: 'ukogan@rzero.com',
          meetingTitle: 'Meeting with Uri',
          zoomLink: 'https://rzero.zoom.us/j/5152335657'
        }
      });
    });
    
    // Generate availability
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Verify automatic clipboard copy
    await expect(page.locator('text=✅ Availability copied to clipboard!')).toBeVisible({ timeout: 2000 });
    
    // Verify clipboard contains expected content
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toContain('Available Times');
    expect(clipboardContent).toContain('Meeting with Uri');
    expect(clipboardContent).toContain('ukogan@rzero.com');
    expect(clipboardContent).toContain('https://rzero.zoom.us/j/5152335657');
  });

  test('CLIP-002: Clipboard content format validation', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Verify professional format structure
    expect(clipboardContent).toMatch(/Available Times - .+/);
    expect(clipboardContent).toMatch(/\n\nTime\s+/);
    expect(clipboardContent).toMatch(/\d{1,2}:\d{2}\s+/);
    expect(clipboardContent).toMatch(/\[BOOK\]|\—/);
    expect(clipboardContent).toMatch(/\n\nMeeting: .+/);
    expect(clipboardContent).toMatch(/Zoom: https?:\/\/.+/);
    expect(clipboardContent).toMatch(/Contact: .+@.+/);
    
    // Verify no HTML or markup
    expect(clipboardContent).not.toContain('<');
    expect(clipboardContent).not.toContain('>');
    expect(clipboardContent).not.toContain('&');
  });

  test('CLIP-003: Manual clipboard copy button functionality', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Disable auto-copy for this test
    await page.evaluate(() => {
      window.electronAPI.setUserSettings({
        behavior: { autoCopy: false }
      });
    });
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Clear clipboard
    await page.evaluate(async () => {
      await navigator.clipboard.writeText('');
    });
    
    // Click manual copy button
    await page.click('[data-testid="copy-button"]');
    
    // Verify copy button feedback
    await expect(page.locator('[data-testid="copy-button"]')).toContainText('✅ Copied!');
    await expect(page.locator('[data-testid="copy-button"]')).toHaveClass(/.*success.*/);
    
    // Verify clipboard content
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toContain('Available Times');
    
    // Verify button returns to normal state
    await expect(page.locator('[data-testid="copy-button"]')).toContainText('📋 Copy to clipboard', { timeout: 4000 });
  });

  test('CLIP-004: Copy last result functionality', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Generate initial availability
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Get initial clipboard content
    const initialContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Clear clipboard
    await page.evaluate(async () => {
      await navigator.clipboard.writeText('different content');
    });
    
    // Use "Copy Last Result" from menu (simulate menu bar interaction)
    await page.evaluate(() => {
      window.electronAPI.copyLastResult();
    });
    
    // Verify clipboard restored to last result
    const restoredContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(restoredContent).toBe(initialContent);
  });

  test('CLIP-005: Handle clipboard permission denied', async () => {
    // Mock clipboard permission denied
    await page.addInitScript(() => {
      window.mockClipboard.writeText = async () => {
        throw new Error('Permission denied');
      };
    });
    
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Verify error handling
    await expect(page.locator('text=Clipboard access denied')).toBeVisible();
    await expect(page.locator('text=Please copy manually')).toBeVisible();
    
    // Verify manual copy options still available
    await expect(page.locator('[data-testid="copy-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="select-all-button"]')).toBeVisible();
  });
});

test.describe('Clipboard Integration - Format Variations', () => {
  let app, electronApp, page;
  
  test.beforeEach(async () => {
    const setup = await AvailabilityTestHelpers.setupAuthenticatedApp();
    app = setup.app;
    electronApp = setup.electronApp;
    page = setup.page;
    
    await ClipboardTestHelpers.setupClipboardAccess(page);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('CLIP-006: Empty calendar clipboard format', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('EMPTY_CALENDAR');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Should show full availability
    expect(clipboardContent).toContain('Available Times');
    expect(clipboardContent).not.toContain('—'); // No unavailable slots
    
    // Count booking links
    const bookCount = (clipboardContent.match(/\[BOOK\]/g) || []).length;
    expect(bookCount).toBeGreaterThan(20); // Should have many available slots
  });

  test('CLIP-007: Fully booked calendar clipboard format', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('FULLY_BOOKED_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Should show no availability
    expect(clipboardContent).toContain('Available Times');
    expect(clipboardContent).not.toContain('[BOOK]'); // No available slots
    
    // Should have helpful message
    expect(clipboardContent).toContain('No availability found');
    expect(clipboardContent).toContain('Try a different date range');
  });

  test('CLIP-008: Weekend availability clipboard format', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('EMPTY_CALENDAR');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Enable weekend availability
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Schedule")');
    await page.check('[data-testid="include-saturday"]');
    await page.check('[data-testid="include-sunday"]');
    await page.click('button:has-text("Save & Close")');
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Should include weekend columns
    expect(clipboardContent).toMatch(/Sat|Saturday/);
    expect(clipboardContent).toMatch(/Sun|Sunday/);
  });

  test('CLIP-009: Different meeting durations clipboard format', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('EMPTY_CALENDAR');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Test 15-minute intervals
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Schedule")');
    await page.selectOption('[data-testid="meeting-duration"]', '15');
    await page.click('button:has-text("Save & Close")');
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Should show 15-minute intervals
    expect(clipboardContent).toContain('9:00');
    expect(clipboardContent).toContain('9:15');
    expect(clipboardContent).toContain('9:30');
    expect(clipboardContent).toContain('9:45');
  });

  test('CLIP-010: Custom meeting information in clipboard', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Configure custom meeting details
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Personal")');
    
    await page.fill('[data-testid="email"]', 'custom@example.com');
    await page.fill('[data-testid="meeting-title"]', 'Strategy Discussion');
    await page.fill('[data-testid="zoom-link"]', 'https://zoom.us/j/123456789');
    await page.fill('[data-testid="meeting-description"]', 'Looking forward to our chat!');
    
    await page.click('button:has-text("Save & Close")');
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Verify custom information included
    expect(clipboardContent).toContain('Strategy Discussion');
    expect(clipboardContent).toContain('custom@example.com');
    expect(clipboardContent).toContain('https://zoom.us/j/123456789');
    expect(clipboardContent).toContain('Looking forward to our chat!');
  });
});

test.describe('Clipboard Integration - Edge Cases', () => {
  let app, electronApp, page;
  
  test.beforeEach(async () => {
    const setup = await AvailabilityTestHelpers.setupAuthenticatedApp();
    app = setup.app;
    electronApp = setup.electronApp;
    page = setup.page;
    
    await ClipboardTestHelpers.setupClipboardAccess(page);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('CLIP-011: Handle very large availability tables', async () => {
    // Test with 14-day range and 15-minute intervals
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Schedule")');
    
    await page.selectOption('[data-testid="date-range"]', '14');
    await page.selectOption('[data-testid="meeting-duration"]', '15');
    await page.check('[data-testid="include-saturday"]');
    await page.check('[data-testid="include-sunday"]');
    
    await page.click('button:has-text("Save & Close")');
    
    const events = AvailabilityTestHelpers.createMockCalendarEvents('EMPTY_CALENDAR');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Verify large table handles correctly
    expect(clipboardContent.length).toBeGreaterThan(5000); // Large content
    expect(clipboardContent).toContain('Available Times');
    
    // Should not crash or truncate
    const bookCount = (clipboardContent.match(/\[BOOK\]/g) || []).length;
    expect(bookCount).toBeGreaterThan(500); // Many slots for 14 days
  });

  test('CLIP-012: Handle special characters in meeting information', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Set meeting info with special characters
    await page.evaluate(() => {
      window.electronAPI.setUserSettings({
        personal: {
          email: 'test+user@company.com',
          meetingTitle: 'Q&A Session (30 mins) - "Strategy & Planning"',
          zoomLink: 'https://zoom.us/j/123?pwd=abc&uname=test',
          meetingDescription: 'Let\'s discuss the "new approach" & next steps!'
        }
      });
    });
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Verify special characters preserved correctly
    expect(clipboardContent).toContain('test+user@company.com');
    expect(clipboardContent).toContain('Q&A Session (30 mins) - "Strategy & Planning"');
    expect(clipboardContent).toContain('https://zoom.us/j/123?pwd=abc&uname=test');
    expect(clipboardContent).toContain('Let\'s discuss the "new approach" & next steps!');
  });

  test('CLIP-013: Clipboard timing performance', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    const startTime = Date.now();
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Wait for clipboard copy confirmation
    await expect(page.locator('text=✅ Availability copied to clipboard!')).toBeVisible();
    
    const clipboardTime = Date.now() - startTime;
    
    // Verify clipboard copy happens quickly after generation
    expect(clipboardTime).toBeLessThan(6000); // Should be within 1 second of generation completion
    
    // Verify clipboard content available immediately
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toContain('Available Times');
  });

  test('CLIP-014: Multiple rapid clipboard operations', async () => {
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Rapidly click copy button multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="copy-button"]');
      await page.waitForTimeout(100);
    }
    
    // Should handle rapid clicks gracefully
    await expect(page.locator('[data-testid="copy-button"]')).toContainText('✅ Copied!');
    
    // Final clipboard content should be correct
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toContain('Available Times');
  });
});

test.describe('Clipboard Integration - Settings Impact', () => {
  let app, electronApp, page;
  
  test.beforeEach(async () => {
    const setup = await AvailabilityTestHelpers.setupAuthenticatedApp();
    app = setup.app;
    electronApp = setup.electronApp;
    page = setup.page;
    
    await ClipboardTestHelpers.setupClipboardAccess(page);
  });

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('CLIP-015: Disable auto-copy functionality', async () => {
    // Disable auto-copy in settings
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Advanced")');
    await page.uncheck('[data-testid="auto-copy"]');
    await page.click('button:has-text("Save & Close")');
    
    const events = AvailabilityTestHelpers.createMockCalendarEvents('TYPICAL_BUSINESS_DAY');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    // Clear clipboard
    await page.evaluate(async () => {
      await navigator.clipboard.writeText('initial content');
    });
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    // Verify no automatic copy occurred
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(clipboardContent).toBe('initial content');
    
    // Verify no auto-copy message
    await expect(page.locator('text=✅ Availability copied to clipboard!')).not.toBeVisible();
    
    // Manual copy should still work
    await page.click('[data-testid="copy-button"]');
    
    const updatedClipboard = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    expect(updatedClipboard).toContain('Available Times');
  });

  test('CLIP-016: Verify clipboard format with different business hours', async () => {
    // Set custom business hours
    await page.click('[data-testid="settings-button"]');
    await page.click('button:has-text("Schedule")');
    
    await page.selectOption('[data-testid="start-time"]', '11');
    await page.selectOption('[data-testid="end-time"]', '15');
    
    await page.click('button:has-text("Save & Close")');
    
    const events = AvailabilityTestHelpers.createMockCalendarEvents('EMPTY_CALENDAR');
    await AvailabilityTestHelpers.mockGoogleCalendarAPI(page, events);
    
    await page.click('[data-testid="generate-button"]');
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    
    // Should only show 11 AM - 3 PM slots
    expect(clipboardContent).toContain('11:00');
    expect(clipboardContent).toContain('14:30');
    expect(clipboardContent).not.toContain('9:00');
    expect(clipboardContent).not.toContain('16:00');
  });
});

module.exports = { ClipboardTestHelpers };