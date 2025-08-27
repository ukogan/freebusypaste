const { google } = require('googleapis');
const { BrowserWindow } = require('electron');
const keytar = require('keytar');
const path = require('path');

class OAuthManager {
  constructor() {
    this.oauth2Client = null;
    this.isAuthenticating = false;
    
    // Load credentials from credentials.json
    this.loadCredentials();
    this.setupOAuthClient();
  }
  
  loadCredentials() {
    try {
      const credentialsPath = path.join(__dirname, '../../credentials.json');
      const fs = require('fs');
      
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        const { client_id, client_secret } = credentials.installed;
        
        this.config = {
          clientId: client_id,
          clientSecret: client_secret,
          redirectUri: 'http://localhost',
          scopes: [
            'https://www.googleapis.com/auth/calendar.readonly'
          ]
        };
        
        this.hasValidCredentials = true;
        console.log('✅ Google OAuth credentials loaded from credentials.json');
        
      } else {
        // Fallback to environment variables
        this.config = {
          clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
          redirectUri: 'http://localhost',
          scopes: [
            'https://www.googleapis.com/auth/calendar.readonly'
          ]
        };
        
        this.hasValidCredentials = this.config.clientId !== 'your-google-client-id' && 
                                  this.config.clientSecret !== 'your-google-client-secret';
        
        if (!this.hasValidCredentials) {
          console.warn('⚠️ Google OAuth credentials not found. Please add credentials.json file or set environment variables.');
        }
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
      this.hasValidCredentials = false;
    }
  }
  
  setupOAuthClient() {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    
    // Set up token refresh handler
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.saveTokens(tokens);
      }
    });
  }
  
  async isAuthenticated() {
    try {
      const tokens = await this.loadTokens();
      if (!tokens) return false;
      
      this.oauth2Client.setCredentials(tokens);
      
      // Check if tokens are valid and not expired
      if (tokens.access_token && tokens.expiry_date > Date.now()) {
        return true;
      }
      
      // Try to refresh tokens
      if (tokens.refresh_token) {
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          await this.saveTokens(credentials);
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          await this.clearTokens();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }
  
  async authenticate() {
    if (this.isAuthenticating) {
      throw new Error('Authentication already in progress');
    }
    
    // Check if OAuth credentials are configured
    if (!this.hasValidCredentials) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables or follow setup instructions in the documentation.');
    }
    
    try {
      this.isAuthenticating = true;
      
      // Generate auth URL
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.config.scopes,
        prompt: 'consent' // Force consent to get refresh token
      });
      
      // Create auth window
      const authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: false,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      // Load auth URL
      await authWindow.loadURL(authUrl);
      authWindow.show();
      
      return new Promise((resolve, reject) => {
        let resolved = false;
        
        // Handle successful callback
        authWindow.webContents.on('will-redirect', async (event, navigationUrl) => {
          if (resolved) return;
          
          try {
            console.log('OAuth redirect detected:', navigationUrl);
            const urlParts = new URL(navigationUrl);
            
            if (urlParts.hostname === 'localhost') {
              const code = urlParts.searchParams.get('code');
              const error = urlParts.searchParams.get('error');
              
              if (error) {
                resolved = true;
                authWindow.close();
                reject(new Error(`OAuth error: ${error}`));
                return;
              }
              
              if (code) {
                console.log('OAuth code received, exchanging for tokens...');
                try {
                  // Exchange code for tokens
                  const { tokens } = await this.oauth2Client.getToken(code);
                  console.log('Tokens received successfully');
                  await this.saveTokens(tokens);
                  
                  this.oauth2Client.setCredentials(tokens);
                  
                  resolved = true;
                  authWindow.close();
                  resolve({ success: true, tokens });
                } catch (tokenError) {
                  console.error('Token exchange failed:', tokenError);
                  resolved = true;
                  authWindow.close();
                  reject(new Error(`Token exchange failed: ${tokenError.message}`));
                }
              }
            }
          } catch (urlError) {
            console.error('Error parsing OAuth redirect URL:', urlError);
            resolved = true;
            authWindow.close();
            reject(new Error(`OAuth URL parsing failed: ${urlError.message}`));
          }
        });
        
        // Handle window closed
        authWindow.on('closed', () => {
          if (!resolved) {
            resolved = true;
            reject(new Error('Authentication window closed by user'));
          }
        });
        
        // Handle navigation errors
        authWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
          if (!resolved) {
            resolved = true;
            authWindow.close();
            reject(new Error(`Failed to load auth page: ${errorDescription}`));
          }
        });
      });
      
    } finally {
      this.isAuthenticating = false;
    }
  }
  
  async logout() {
    try {
      // Clear stored tokens
      await this.clearTokens();
      
      // Reset OAuth client
      this.oauth2Client.setCredentials({});
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
  
  async getAuthenticatedClient() {
    if (!await this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    return this.oauth2Client;
  }
  
  async saveTokens(tokens) {
    try {
      // Add expiry date if not present
      if (tokens.expiry_date === undefined && tokens.expires_in) {
        tokens.expiry_date = Date.now() + (tokens.expires_in * 1000);
      }
      
      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date,
        scope: this.config.scopes.join(' ')
      };
      
      // Store in macOS Keychain
      await keytar.setPassword(
        'freebusy-desktop',
        'google-oauth',
        JSON.stringify(tokenData)
      );
      
      console.log('Tokens saved successfully');
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw new Error(`Token save failed: ${error.message}`);
    }
  }
  
  async loadTokens() {
    try {
      const tokenString = await keytar.getPassword('freebusy-desktop', 'google-oauth');
      
      if (!tokenString) {
        return null;
      }
      
      const tokens = JSON.parse(tokenString);
      
      // Validate token structure
      if (!tokens.access_token) {
        console.warn('Invalid token structure, clearing tokens');
        await this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to load tokens:', error);
      await this.clearTokens(); // Clear invalid tokens
      return null;
    }
  }
  
  async clearTokens() {
    try {
      await keytar.deletePassword('freebusy-desktop', 'google-oauth');
      console.log('Tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
  
  async getUserInfo() {
    try {
      const authClient = await this.getAuthenticatedClient();
      const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
      
      const response = await oauth2.userinfo.get();
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error(`User info fetch failed: ${error.message}`);
    }
  }
}

module.exports = OAuthManager;