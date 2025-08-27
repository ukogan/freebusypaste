// tests/unit/auth/oauth-manager.test.js
const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');

// Mock external dependencies
jest.mock('keytar', () => ({
  setPassword: jest.fn().mockResolvedValue(),
  getPassword: jest.fn().mockResolvedValue(null),
  deletePassword: jest.fn().mockResolvedValue()
}));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
        getAccessToken: jest.fn(),
        refreshToken: jest.fn(),
        credentials: {},
        on: jest.fn(), // Add the 'on' method that was missing
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?test=true')
      }))
    }
  }
}));

jest.mock('electron', () => ({
  shell: { 
    openExternal: jest.fn().mockResolvedValue()
  }
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

// Mock the OAuth server
jest.mock('../../main/auth/oauth-server', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue({ port: 8080 }),
    stop: jest.fn().mockResolvedValue(),
    setAuthCodeHandler: jest.fn()
  }));
});

describe('OAuthManagerV2', () => {
  let authManager;
  const fs = require('fs');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock valid credentials file
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({
      installed: {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret'
      }
    }));
  });

  describe('Initialization', () => {
    test('AUTH-UNIT-001: Should initialize with valid credentials', () => {
      authManager = new OAuthManagerV2();
      
      expect(authManager.hasValidCredentials).toBe(true);
      expect(authManager.config.clientId).toBe('test-client-id');
      expect(authManager.config.clientSecret).toBe('test-client-secret');
    });

    test('AUTH-UNIT-002: Should handle missing credentials file', () => {
      fs.existsSync.mockReturnValue(false);
      
      authManager = new OAuthManagerV2();
      
      expect(authManager.hasValidCredentials).toBe(false);
    });

    test('AUTH-UNIT-003: Should handle malformed credentials file', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });
      
      authManager = new OAuthManagerV2();
      
      expect(authManager.hasValidCredentials).toBe(false);
    });
  });

  describe('Authentication Status', () => {
    beforeEach(() => {
      authManager = new OAuthManagerV2();
    });

    test('AUTH-UNIT-004: Should correctly identify unauthenticated state', async () => {
      const keytar = require('keytar');
      keytar.getPassword.mockResolvedValue(null);
      
      const isAuth = await authManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
      expect(keytar.getPassword).toHaveBeenCalledWith('freebusy-desktop', 'google-calendar');
    });

    test('AUTH-UNIT-005: Should correctly identify authenticated state with valid tokens', async () => {
      const keytar = require('keytar');
      const validTokens = JSON.stringify({
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expiry_date: Date.now() + 3600000 // 1 hour from now
      });
      
      keytar.getPassword.mockResolvedValue(validTokens);
      
      const isAuth = await authManager.isAuthenticated();
      
      expect(isAuth).toBe(true);
    });

    test('AUTH-UNIT-006: Should handle expired tokens', async () => {
      const keytar = require('keytar');
      const expiredTokens = JSON.stringify({
        access_token: 'expired-token',
        refresh_token: 'refresh-token',
        expiry_date: Date.now() - 3600000 // 1 hour ago
      });
      
      keytar.getPassword.mockResolvedValue(expiredTokens);
      
      const isAuth = await authManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });

  describe('Token Management', () => {
    beforeEach(() => {
      authManager = new OAuthManagerV2();
    });

    test('AUTH-UNIT-007: Should store tokens securely', async () => {
      const keytar = require('keytar');
      const tokens = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expiry_date: Date.now() + 3600000
      };
      
      await authManager.saveTokens(tokens); // Use correct method name
      
      expect(keytar.setPassword).toHaveBeenCalledWith(
        'freebusy-desktop',
        'google-calendar',
        JSON.stringify(tokens)
      );
    });

    test('AUTH-UNIT-008: Should clear tokens on logout', async () => {
      const keytar = require('keytar');
      
      await authManager.clearTokens();
      
      expect(keytar.deletePassword).toHaveBeenCalledWith(
        'freebusy-desktop',
        'google-calendar'
      );
    });

    test('AUTH-UNIT-009: Should handle keychain errors gracefully', async () => {
      const keytar = require('keytar');
      keytar.getPassword.mockRejectedValue(new Error('Keychain access denied'));
      
      const isAuth = await authManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });

  describe('OAuth Flow', () => {
    beforeEach(() => {
      authManager = new OAuthManagerV2();
    });

    test('AUTH-UNIT-010: Should generate valid OAuth URL', async () => {
      const authUrl = await authManager.getAuthUrl();
      
      expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('scope=https%3A//www.googleapis.com/auth/calendar.readonly');
      expect(authUrl).toContain('response_type=code');
    });

    test('AUTH-UNIT-011: Should handle OAuth server startup', async () => {
      // Test server startup (mocked internally)
      await expect(authManager.authenticate()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      authManager = new OAuthManagerV2();
    });

    test('AUTH-UNIT-012: Should handle missing credentials gracefully', () => {
      fs.existsSync.mockReturnValue(false);
      
      const authManagerNoCreds = new OAuthManagerV2();
      
      expect(authManagerNoCreds.hasValidCredentials).toBe(false);
      expect(() => authManagerNoCreds.getAuthUrl()).toThrow('No OAuth credentials available');
    });

    test('AUTH-UNIT-013: Should handle token parsing errors', async () => {
      const keytar = require('keytar');
      keytar.getPassword.mockResolvedValue('invalid-json');
      
      const isAuth = await authManager.isAuthenticated();
      
      expect(isAuth).toBe(false);
    });
  });
});