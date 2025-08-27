const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const { default: Store } = require('electron-store');

// Import managers
const AuthManager = require('./auth/oauth-manager-v2');
const DemoAuthManager = require('./auth/demo-auth-manager');
const SettingsManager = require('./storage/settings-manager');
const MenuBarManager = require('./system/menubar-manager');
const AvailabilityGenerator = require('./calendar/availability-generator');
const DemoAvailabilityGenerator = require('./calendar/demo-availability-generator');

class FreeBusyApp {
  constructor() {
    this.mainWindow = null;
    this.settingsWindow = null;
    this.tray = null;
    this.store = new Store({ 
      name: 'freebusy-settings',
      projectName: 'freebusy-desktop'
    });
    
    // Check if demo mode is enabled
    this.isDemoMode = process.env.DEMO_MODE === 'true';
    
    // Initialize managers
    this.authManager = this.isDemoMode ? new DemoAuthManager() : new AuthManager();
    this.settingsManager = new SettingsManager(this.store);
    this.menuBarManager = new MenuBarManager(this);
    this.availabilityGenerator = this.isDemoMode ? 
      new DemoAvailabilityGenerator(this.authManager) : 
      new AvailabilityGenerator(this.authManager);
    
    if (this.isDemoMode) {
      console.log('🎭 Running in DEMO MODE - No Google credentials required');
    }
    
    this.setupApp();
  }
  
  setupApp() {
    // Handle app ready
    app.whenReady().then(() => {
      console.log('App ready, initializing...');
      this.createMainWindow();
      this.setupMenuBar();
      this.setupIPC();
      console.log('App initialization complete');
      
      app.on('activate', () => {
        console.log('App activated');
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    }).catch(error => {
      console.error('App initialization failed:', error);
    });
    
    // Handle all windows closed
    app.on('window-all-closed', () => {
      // Don't quit on macOS when all windows are closed
      // App should continue running in menu bar
      console.log('All windows closed, but keeping app running in menu bar');
    });
    
    // Handle app quit
    app.on('before-quit', () => {
      this.cleanup();
    });
  }
  
  createMainWindow() {
    // Don't create duplicate windows
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
      return;
    }
    
    try {
      console.log('Creating main window...');
      this.mainWindow = new BrowserWindow({
        width: 720,
        height: 480,
        resizable: true,
        titleBarStyle: 'default',
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, '../renderer/preload.js')
        }
      });
      
      // Load main window
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/views/main-window.html'))
        .then(() => {
          console.log('Main window loaded successfully');
          this.mainWindow.show();
          this.mainWindow.focus();
        })
        .catch(error => {
          console.error('Failed to load main window:', error);
        });
      
      // Handle window closed
      this.mainWindow.on('closed', () => {
        console.log('Main window closed');
        this.mainWindow = null;
      });
      
      // Development: Open DevTools
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow.webContents.openDevTools();
      }
      
    } catch (error) {
      console.error('Failed to create main window:', error);
    }
  }
  
  setupMenuBar() {
    this.menuBarManager.create();
  }
  
  setupIPC() {
    // Authentication handlers
    ipcMain.handle('auth:check-status', async () => {
      try {
        return await this.authManager.isAuthenticated();
      } catch (error) {
        console.error('Failed to check auth status:', error);
        return false;
      }
    });
    
    ipcMain.handle('app:is-demo-mode', async () => {
      return this.isDemoMode;
    });
    
    ipcMain.handle('auth:login', async () => {
      try {
        console.log('Authentication request received from renderer');
        const result = await this.authManager.authenticate();
        console.log('Authentication completed successfully');
        
        // Notify renderer of auth status change
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('auth-status-changed', true);
        }
        
        return { success: true, result };
      } catch (error) {
        console.error('Authentication failed in main process:', error);
        console.error('Stack trace:', error.stack);
        
        // Notify renderer of error
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('error-occurred', {
            title: 'Authentication Failed',
            message: error.message
          });
        }
        
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('auth:logout', async () => {
      try {
        const result = await this.authManager.logout();
        
        // Notify renderer of auth status change
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('auth-status-changed', false);
        }
        
        return { success: true, result };
      } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
      }
    });
    
    // Settings handlers
    ipcMain.handle('settings:get', async () => {
      try {
        const settings = await this.settingsManager.getSettings();
        return settings;
      } catch (error) {
        console.error('Failed to get settings:', error);
        return this.settingsManager.getDefaults();
      }
    });
    
    // Onboarding handlers
    ipcMain.handle('app:is-first-run', async () => {
      try {
        return this.settingsManager.isFirstRun();
      } catch (error) {
        console.error('Failed to check first run:', error);
        return true;
      }
    });
    
    ipcMain.handle('app:complete-onboarding', async () => {
      try {
        this.settingsManager.markOnboardingCompleted();
        return { success: true };
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        return { success: false, error: error.message };
      }
    });
    
    ipcMain.handle('settings:save', async (event, settings) => {
      try {
        const result = await this.settingsManager.saveSettings(settings);
        return { success: true, settings: result };
      } catch (error) {
        console.error('Failed to save settings:', error);
        return { success: false, error: error.message };
      }
    });
    
    // Availability generation handlers
    ipcMain.handle('availability:generate', async (event, options) => {
      try {
        console.log('Availability generation request received:', options);
        const availability = await this.availabilityGenerator.generate(options);
        console.log('Availability generated successfully');
        
        // Notify renderer of successful generation
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('availability-generated', availability);
        }
        
        return { success: true, data: availability };
      } catch (error) {
        console.error('Availability generation failed:', error);
        
        // Notify renderer of error
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('error-occurred', {
            title: 'Generation Failed',
            message: error.message
          });
        }
        
        return { success: false, error: error.message };
      }
    });
    
    // Window management handlers
    ipcMain.handle('window:show', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      } else {
        this.createMainWindow();
      }
    });
    
    ipcMain.handle('window:hide', () => {
      if (this.mainWindow) {
        this.mainWindow.hide();
      }
    });
    
    ipcMain.handle('window:minimize', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
      }
    });
    
    // External link handler
    ipcMain.handle('open-external', (event, url) => {
      shell.openExternal(url);
    });
    
    // Clipboard handlers
    ipcMain.handle('clipboard:write-text', (event, text) => {
      const { clipboard } = require('electron');
      clipboard.writeText(text);
    });

    ipcMain.handle('clipboard:write-html', (event, html) => {
      const { clipboard } = require('electron');
      clipboard.writeHTML(html);
    });
    
    ipcMain.handle('clipboard:read-text', () => {
      const { clipboard } = require('electron');
      return clipboard.readText();
    });
  }
  
  showMainWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show();
      this.mainWindow.focus();
    } else {
      this.createMainWindow();
    }
  }
  
  async generateAvailability(options = {}) {
    try {
      const availability = await this.availabilityGenerator.generate(options);
      
      // Notify main window if open
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('availability-generated', availability);
      }
      
      return availability;
    } catch (error) {
      console.error('Failed to generate availability:', error);
      throw error;
    }
  }
  
  cleanup() {
    // Clean up resources
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    
    // Close any open windows
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close();
    }
    
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.close();
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Create app instance
try {
  const freeBusyApp = new FreeBusyApp();
} catch (error) {
  console.error('Failed to create FreeBusy app:', error);
  console.error('Stack:', error.stack);
}

// Export for testing
module.exports = FreeBusyApp;