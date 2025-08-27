// Demo authentication manager for testing without Google credentials
class DemoAuthManager {
  constructor() {
    this.authenticated = false;
    this.demoUser = {
      email: 'demo@example.com',
      name: 'Demo User'
    };
  }
  
  async isAuthenticated() {
    return this.authenticated;
  }
  
  async authenticate() {
    console.log('🎭 Demo mode: Simulating Google authentication...');
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.authenticated = true;
    return { 
      success: true, 
      user: this.demoUser,
      tokens: { demo: true }
    };
  }
  
  async logout() {
    this.authenticated = false;
    return { success: true };
  }
  
  async getAuthenticatedClient() {
    if (!this.authenticated) {
      throw new Error('User not authenticated');
    }
    
    // Return a mock client that can be used with the demo calendar service
    return {
      demo: true,
      user: this.demoUser
    };
  }
  
  async getUserInfo() {
    if (!this.authenticated) {
      throw new Error('User not authenticated');
    }
    
    return this.demoUser;
  }
}

module.exports = DemoAuthManager;