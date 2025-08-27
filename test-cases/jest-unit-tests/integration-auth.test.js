// Integration test using actual demo auth manager
const DemoAuthManager = require('../../main/auth/demo-auth-manager');
const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');

// Only mock external dependencies, not our code
jest.mock('keytar', () => ({
  setPassword: jest.fn().mockResolvedValue(),
  getPassword: jest.fn().mockResolvedValue(null),
  deletePassword: jest.fn().mockResolvedValue()
}));

jest.mock('electron', () => ({
  shell: { openExternal: jest.fn() }
}));

describe('Auth Integration Tests', () => {
  describe('Demo Auth Manager', () => {
    let demoAuth;

    beforeEach(() => {
      demoAuth = new DemoAuthManager();
    });

    test('DEMO-AUTH-001: Should initialize in demo mode', () => {
      expect(demoAuth).toBeDefined();
      expect(demoAuth.demoUser).toBeDefined();
      expect(demoAuth.demoUser.email).toBe('demo@example.com');
    });

    test('DEMO-AUTH-002: Should authenticate and provide client', async () => {
      // Must authenticate first
      const authResult = await demoAuth.authenticate();
      expect(authResult.success).toBe(true);
      
      const client = await demoAuth.getAuthenticatedClient();
      expect(client).toBeDefined();
      expect(client.demo).toBe(true);
    });

    test('DEMO-AUTH-003: Should return false initially, true after auth', async () => {
      // Should be false initially
      expect(await demoAuth.isAuthenticated()).toBe(false);
      
      // Should be true after authentication
      await demoAuth.authenticate();
      expect(await demoAuth.isAuthenticated()).toBe(true);
    });
  });

  describe('OAuth Manager (without credentials)', () => {
    let oauthManager;

    beforeEach(() => {
      // Mock fs to return no credentials file
      jest.doMock('fs', () => ({
        existsSync: jest.fn().mockReturnValue(false),
        readFileSync: jest.fn()
      }));
      
      // Create new instance after mocking
      delete require.cache[require.resolve('../../main/auth/oauth-manager-v2')];
      const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');
      oauthManager = new OAuthManagerV2();
    });

    test('OAUTH-INT-001: Should handle missing credentials gracefully', () => {
      expect(oauthManager.hasValidCredentials).toBe(false);
    });

    test('OAUTH-INT-002: Should not set up OAuth client without credentials', () => {
      expect(oauthManager.oauth2Client).toBeNull();
    });

    test('OAUTH-INT-003: Should return false for authentication check', async () => {
      const isAuth = await oauthManager.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    afterEach(() => {
      jest.dontMock('fs');
      // Clean up require cache
      delete require.cache[require.resolve('../../main/auth/oauth-manager-v2')];
    });
  });
});