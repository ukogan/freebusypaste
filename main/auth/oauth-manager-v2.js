const { google } = require('googleapis');
const { shell, app } = require('electron');
const keytar = require('keytar');
const path = require('path');
const fs = require('fs');
const OAuthServer = require('./oauth-server');

class OAuthManagerV2 {
  constructor() {
    this.oauth2Client = null;
    this.isAuthenticating = false;
    this.oauthServer = new OAuthServer();
    
    // Load credentials from credentials.json
    this.loadCredentials();
    this.setupOAuthClient();
  }
  
  loadCredentials() {
    try {
      // First try user data directory (uploaded credentials)
      const userDataPath = this.getUserCredentialsPath();
      
      // Then try project root (development)
      const projectCredentialsPath = path.join(__dirname, '../../credentials.json');
      
      let credentialsPath;
      if (fs.existsSync(userDataPath)) {
        credentialsPath = userDataPath;
      } else if (fs.existsSync(projectCredentialsPath)) {
        credentialsPath = projectCredentialsPath;
      } else {
        console.warn('⚠️ No credentials.json found in user data or project directory');
        this.hasValidCredentials = false;
        return;
      }
      
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Validate credentials structure
      if (!this.validateCredentials(credentials)) {
        console.error('❌ Invalid credentials structure');
        this.hasValidCredentials = false;
        return;
      }
      
      const { client_id, client_secret } = credentials.installed;
      
      this.config = {
        clientId: client_id,
        clientSecret: client_secret,
        redirectUri: 'http://localhost:8080/oauth/callback', // Will be updated when server starts
        scopes: [
          'https://www.googleapis.com/auth/calendar.readonly'
        ]
      };
      
      this.hasValidCredentials = true;
      console.log(`✅ Google OAuth credentials loaded from ${credentialsPath}`);
      
    } catch (error) {
      console.error('Failed to load credentials:', error);
      this.hasValidCredentials = false;
    }
  }
  
  getUserCredentialsPath() {
    const userDataDir = app.getPath('userData');
    return path.join(userDataDir, 'credentials.json');
  }
  
  validateCredentials(credentials) {
    return (
      credentials &&
      credentials.installed &&
      credentials.installed.client_id &&
      credentials.installed.client_secret &&
      credentials.installed.auth_uri &&
      credentials.installed.token_uri
    );
  }
  
  async uploadCredentials(credentialsData) {
    try {
      // Validate the credentials structure
      const credentials = JSON.parse(credentialsData);
      
      if (!this.validateCredentials(credentials)) {
        throw new Error('Invalid credentials file format. Please ensure you downloaded the correct OAuth2 client credentials from Google Cloud Console.');
      }
      
      // Save to user data directory
      const userCredentialsPath = this.getUserCredentialsPath();
      const userDataDir = path.dirname(userCredentialsPath);
      
      // Ensure directory exists
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      
      fs.writeFileSync(userCredentialsPath, credentialsData, 'utf8');
      
      // Reload credentials
      this.loadCredentials();
      this.setupOAuthClient();
      
      if (this.hasValidCredentials) {
        console.log('✅ Credentials uploaded and validated successfully');
        return { success: true, message: 'Credentials uploaded successfully!' };
      } else {
        throw new Error('Failed to load uploaded credentials');
      }
      
    } catch (error) {
      console.error('Failed to upload credentials:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to upload credentials' 
      };
    }
  }
  
  setupOAuthClient() {
    if (!this.hasValidCredentials) return;
    
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
    
    if (!this.hasValidCredentials) {
      throw new Error('Google OAuth credentials not configured. Please add credentials.json file.');
    }
    
    try {
      this.isAuthenticating = true;
      console.log('🔐 Starting OAuth authentication...');
      
      // Start OAuth server
      const redirectUri = await this.oauthServer.start();
      console.log('OAuth server started:', redirectUri);
      
      // Update redirect URI with actual port
      this.config.redirectUri = redirectUri;
      this.oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );
      
      // Generate auth URL
      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: this.config.scopes,
        prompt: 'consent'
      });
      
      console.log('Opening browser for authentication...');
      
      return new Promise((resolve, reject) => {
        let resolved = false;
        
        // Handle OAuth server events
        this.oauthServer.on('code', async (code) => {
          if (resolved) return;
          resolved = true;
          
          try {
            console.log('OAuth code received, exchanging for tokens...');
            const { tokens } = await this.oauth2Client.getToken(code);
            console.log('Tokens received successfully:', Object.keys(tokens));
            
            console.log('Saving tokens to keychain...');
            await this.saveTokens(tokens);
            console.log('Tokens saved successfully');
            
            console.log('Setting credentials on OAuth client...');
            this.oauth2Client.setCredentials(tokens);
            
            console.log('Stopping OAuth server...');
            this.oauthServer.stop();
            
            console.log('Resolving authentication promise...');
            resolve({ success: true, tokens });
            
          } catch (error) {
            console.error('Token handling failed:', error);
            console.error('Stack trace:', error.stack);
            this.oauthServer.stop();
            reject(new Error(`Token exchange failed: ${error.message}`));
          }
        });
        
        this.oauthServer.on('error', (error) => {
          if (resolved) return;
          resolved = true;
          
          console.error('OAuth server error:', error);
          this.oauthServer.stop();
          reject(error);
        });
        
        // Set timeout for authentication
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.oauthServer.stop();
            reject(new Error('Authentication timeout (5 minutes)'));
          }
        }, 5 * 60 * 1000); // 5 minutes
        
        // Open browser
        shell.openExternal(authUrl).catch(error => {
          if (!resolved) {
            resolved = true;
            this.oauthServer.stop();
            reject(new Error(`Failed to open browser: ${error.message}`));
          }
        });
      });
      
    } finally {
      this.isAuthenticating = false;
    }
  }
  
  async logout() {
    try {
      await this.clearTokens();
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
      await this.clearTokens();
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

module.exports = OAuthManagerV2;