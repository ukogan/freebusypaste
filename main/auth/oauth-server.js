const http = require('http');
const url = require('url');

class OAuthServer {
  constructor() {
    this.server = null;
    this.port = 8080;
  }
  
  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        console.log('OAuth callback received:', req.url);
        
        // Handle OAuth callback
        if (parsedUrl.pathname === '/oauth/callback' || parsedUrl.pathname === '/') {
          const { code, error, error_description } = parsedUrl.query;
          
          // Send response to browser
          res.writeHead(200, { 'Content-Type': 'text/html' });
          
          if (error) {
            res.end(`
              <html>
                <head><title>Authentication Failed</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>❌ Authentication Failed</h1>
                  <p>Error: ${error}</p>
                  <p>${error_description || ''}</p>
                  <p>You can close this window and try again.</p>
                  <script>setTimeout(() => window.close(), 3000);</script>
                </body>
              </html>
            `);
            
            this.emit('error', new Error(`OAuth error: ${error} - ${error_description}`));
          } else if (code) {
            res.end(`
              <html>
                <head><title>Authentication Successful</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>✅ Authentication Successful!</h1>
                  <p>You can close this window and return to FreeBusy.</p>
                  <script>setTimeout(() => window.close(), 3000);</script>
                </body>
              </html>
            `);
            
            this.emit('code', code);
          } else {
            res.end(`
              <html>
                <head><title>Invalid Request</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h1>❓ Invalid Request</h1>
                  <p>No authorization code received.</p>
                  <p>You can close this window and try again.</p>
                  <script>setTimeout(() => window.close(), 3000);</script>
                </body>
              </html>
            `);
            
            this.emit('error', new Error('No authorization code received'));
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });
      
      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${this.port} in use, trying ${this.port + 1}`);
          this.port += 1;
          this.server.listen(this.port);
        } else {
          reject(err);
        }
      });
      
      this.server.listen(this.port, 'localhost', () => {
        console.log(`OAuth server listening on http://localhost:${this.port}`);
        resolve(`http://localhost:${this.port}/oauth/callback`);
      });
    });
  }
  
  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
  
  // Simple event emitter functionality
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  on(event, callback) {
    if (!this.listeners) {
      this.listeners = {};
    }
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
}

module.exports = OAuthServer;