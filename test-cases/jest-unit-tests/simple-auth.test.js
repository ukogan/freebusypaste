// Simple working auth test
const path = require('path');

// Mock all external dependencies first
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
        getAccessToken: jest.fn().mockResolvedValue({ token: 'test' }),
        refreshAccessToken: jest.fn().mockResolvedValue({ credentials: { access_token: 'new-token' } }),
        generateAuthUrl: jest.fn().mockReturnValue('https://test-auth-url.com'),
        on: jest.fn(),
        credentials: {}
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
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(JSON.stringify({
    installed: {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret'
    }
  }))
}));

// Mock the OAuth server
const mockOAuthServer = {
  start: jest.fn().mockResolvedValue({ port: 8080 }),
  stop: jest.fn().mockResolvedValue(),
  setAuthCodeHandler: jest.fn()
};

jest.mock('../../main/auth/oauth-server', () => {
  return jest.fn().mockImplementation(() => mockOAuthServer);
});

describe('Simple Auth Tests', () => {
  test('AUTH-SIMPLE-001: Should require credentials to be loaded first', () => {
    const fs = require('fs');
    
    // Test missing credentials
    fs.existsSync.mockReturnValue(false);
    
    const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');
    const authManager = new OAuthManagerV2();
    
    expect(authManager.hasValidCredentials).toBe(false);
  });

  test('AUTH-SIMPLE-002: Should load valid credentials', () => {
    const fs = require('fs');
    
    // Test valid credentials
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({
      installed: {
        client_id: 'test-client-id',
        client_secret: 'test-client-secret'
      }
    }));
    
    const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');
    const authManager = new OAuthManagerV2();
    
    expect(authManager.hasValidCredentials).toBe(true);
    expect(authManager.config.clientId).toBe('test-client-id');
  });

  test('AUTH-SIMPLE-003: Should handle unauthenticated state', async () => {
    const keytar = require('keytar');
    keytar.getPassword.mockResolvedValue(null);
    
    const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');
    const authManager = new OAuthManagerV2();
    
    const isAuth = await authManager.isAuthenticated();
    expect(isAuth).toBe(false);
  });

  test('AUTH-SIMPLE-004: Should handle keychain errors gracefully', async () => {
    const keytar = require('keytar');
    keytar.getPassword.mockRejectedValue(new Error('Keychain error'));
    
    const OAuthManagerV2 = require('../../main/auth/oauth-manager-v2');
    const authManager = new OAuthManagerV2();
    
    const isAuth = await authManager.isAuthenticated();
    expect(isAuth).toBe(false);
  });
});