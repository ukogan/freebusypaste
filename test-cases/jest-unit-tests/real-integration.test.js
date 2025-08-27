// Pure integration tests - no mocks, no fallbacks, real code only
const path = require('path');

// Test environment setup - use actual demo mode
process.env.DEMO_MODE = 'true';

describe('Real Integration Tests - Demo Mode', () => {
  describe('Demo Auth Manager', () => {
    test('REAL-001: Should load and initialize demo auth manager', async () => {
      const DemoAuthManager = require('../../main/auth/demo-auth-manager');
      const manager = new DemoAuthManager();
      
      expect(manager).toBeDefined();
      expect(typeof manager.isAuthenticated).toBe('function');
    });

    test('REAL-002: Demo auth should authenticate and provide working client', async () => {
      const DemoAuthManager = require('../../main/auth/demo-auth-manager');
      const manager = new DemoAuthManager();
      
      // Follow the real API - authenticate first
      const authResult = await manager.authenticate();
      expect(authResult.success).toBe(true);
      expect(authResult.user).toBeDefined();
      
      // Now should be authenticated
      const isAuth = await manager.isAuthenticated();
      expect(isAuth).toBe(true);
      
      // Now can get client
      const client = await manager.getAuthenticatedClient();
      expect(client).toBeDefined();
      expect(client.demo).toBe(true);
    });
  });

  describe('Demo Availability Generator', () => {
    test('REAL-003: Should load and initialize demo availability generator', () => {
      const DemoAvailabilityGenerator = require('../../main/calendar/demo-availability-generator');
      const generator = new DemoAvailabilityGenerator();
      
      expect(generator).toBeDefined();
      expect(typeof generator.generate).toBe('function');
    });

    test('REAL-004: Should generate demo availability data', async () => {
      const DemoAvailabilityGenerator = require('../../main/calendar/demo-availability-generator');
      const generator = new DemoAvailabilityGenerator();
      
      const result = await generator.generate();
      
      expect(result).toBeDefined();
      expect(result.generationId).toBeDefined();
      expect(result.availability).toBeDefined();
    });
  });

  describe('Real Integration - Demo Components', () => {
    test('REAL-005: Should integrate demo auth with demo availability generator', async () => {
      const DemoAuthManager = require('../../main/auth/demo-auth-manager');
      const DemoAvailabilityGenerator = require('../../main/calendar/demo-availability-generator');
      
      const authManager = new DemoAuthManager();
      const generator = new DemoAvailabilityGenerator();
      
      // Authenticate first - this is the real API flow
      await authManager.authenticate();
      expect(await authManager.isAuthenticated()).toBe(true);
      
      // Test the actual demo integration
      const result = await generator.generate({
        businessHoursStart: 9,
        businessHoursEnd: 17,
        dateRangeDays: 3
      });
      
      expect(result).toBeDefined();
      expect(result.generationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.availability).toBeDefined();
      expect(result.formats).toBeDefined();
      expect(result.formats.markdown).toBeDefined();
    });

    test('REAL-006: Should demonstrate full demo workflow', async () => {
      const DemoAuthManager = require('../../main/auth/demo-auth-manager');
      const DemoAvailabilityGenerator = require('../../main/calendar/demo-availability-generator');
      
      // Complete demo workflow
      const authManager = new DemoAuthManager();
      
      // 1. Check initial state
      expect(await authManager.isAuthenticated()).toBe(false);
      
      // 2. Authenticate
      const authResult = await authManager.authenticate();
      expect(authResult.success).toBe(true);
      expect(authResult.user.email).toBe('demo@example.com');
      
      // 3. Generate availability
      const generator = new DemoAvailabilityGenerator();
      const availability = await generator.generate({
        email: authResult.user.email,
        meetingTitle: 'Demo Meeting'
      });
      
      // 4. Verify complete workflow
      expect(availability.meetingDetails.attendeeEmail).toBe('demo@example.com');
      expect(availability.meetingDetails.title).toBe('Demo Meeting');
      expect(availability.availability.length).toBeGreaterThan(0);
      
      // 5. Logout
      await authManager.logout();
      expect(await authManager.isAuthenticated()).toBe(false);
    });
  });
});

describe('Real File System Tests', () => {
  test('REAL-007: Should find main app entry point', () => {
    const fs = require('fs');
    const appPath = path.join(__dirname, '../../main/app.js');
    
    expect(fs.existsSync(appPath)).toBe(true);
  });

  test('REAL-008: Should find all required modules', () => {
    const fs = require('fs');
    const modules = [
      '../../main/auth/demo-auth-manager.js',
      '../../main/auth/oauth-manager-v2.js', 
      '../../main/calendar/availability-generator.js',
      '../../main/calendar/demo-availability-generator.js'
    ];
    
    modules.forEach(modulePath => {
      const fullPath = path.join(__dirname, modulePath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });
});

describe('Real Module Loading Tests', () => {
  test('REAL-009: Should load all modules without errors', () => {
    expect(() => require('../../main/auth/demo-auth-manager')).not.toThrow();
    expect(() => require('../../main/auth/oauth-manager-v2')).not.toThrow();
    expect(() => require('../../main/calendar/availability-generator')).not.toThrow();
    expect(() => require('../../main/calendar/demo-availability-generator')).not.toThrow();
  });

  test('REAL-010: Should create instances without errors', () => {
    const DemoAuthManager = require('../../main/auth/demo-auth-manager');
    const DemoAvailabilityGenerator = require('../../main/calendar/demo-availability-generator');
    
    expect(() => new DemoAuthManager()).not.toThrow();
    expect(() => new DemoAvailabilityGenerator()).not.toThrow();
  });
});