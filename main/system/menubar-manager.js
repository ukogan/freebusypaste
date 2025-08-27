const { Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');

class MenuBarManager {
  constructor(app) {
    this.app = app;
    this.tray = null;
    this.lastGenerationResult = null;
    this.isGenerating = false;
  }
  
  create() {
    try {
      // Create tray icon (using a simple calendar emoji for now)
      // TODO: Replace with proper icon file
      const iconPath = this.createTrayIcon();
      this.tray = new Tray(iconPath);
      
      this.setupMenu();
      this.setupEventHandlers();
      
      console.log('Menu bar integration created successfully');
    } catch (error) {
      console.error('Failed to create menu bar integration:', error);
      throw error;
    }
  }
  
  createTrayIcon() {
    // Create a simple text-based icon for now
    // In production, this should be a proper .icns file
    return nativeImage.createFromNamedImage('NSCalendarTemplate', [16, 16]);
  }
  
  setupMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '⚡ Quick Generate',
        accelerator: 'CommandOrControl+Shift+G',
        click: () => this.quickGenerate(),
        enabled: !this.isGenerating
      },
      {
        label: '📋 Copy Last Result',
        click: () => this.copyLastResult(),
        enabled: !!this.lastGenerationResult
      },
      { type: 'separator' },
      {
        label: '🏠 Show App',
        click: () => this.app.showMainWindow()
      },
      {
        label: '⚙️ Settings',
        click: () => this.openSettings()
      },
      {
        label: '❓ Help',
        click: () => this.openHelp()
      },
      { type: 'separator' },
      {
        label: '❌ Quit FreeBusy',
        accelerator: 'CommandOrControl+Q',
        click: () => this.quitApp()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }
  
  setupEventHandlers() {
    // Handle tray icon click (show/hide main window)
    this.tray.on('click', () => {
      this.toggleMainWindow();
    });
    
    // Handle right-click (show context menu)
    this.tray.on('right-click', () => {
      this.tray.popUpContextMenu();
    });
    
    // Set tooltip
    this.tray.setToolTip('FreeBusy - Calendar Availability');
  }
  
  async quickGenerate() {
    if (this.isGenerating) {
      return;
    }
    
    try {
      this.isGenerating = true;
      this.updateMenuState();
      this.setTrayIcon('generating');
      
      // Get user settings for generation
      const settings = this.app.settingsManager.getSettings();
      const generationOptions = {
        ...settings.personal,
        ...settings.schedule
      };
      
      // Generate availability
      const result = await this.app.generateAvailability(generationOptions);
      
      // Store result for "Copy Last Result"
      this.lastGenerationResult = result;
      
      // Copy to clipboard automatically if enabled
      if (settings.behavior.autoCopyToClipboard) {
        await this.copyToClipboard(result.formats.html);
      }
      
      // Show notification
      if (settings.behavior.showDesktopNotifications) {
        this.showNotification('Availability Generated', 'Your availability has been copied to the clipboard');
      }
      
      this.setTrayIcon('success');
      
      // Reset icon after 2 seconds
      setTimeout(() => {
        this.setTrayIcon('default');
      }, 2000);
      
    } catch (error) {
      console.error('Quick generation failed:', error);
      
      this.setTrayIcon('error');
      this.showNotification('Generation Failed', error.message);
      
      // Reset icon after 3 seconds
      setTimeout(() => {
        this.setTrayIcon('default');
      }, 3000);
      
    } finally {
      this.isGenerating = false;
      this.updateMenuState();
    }
  }
  
  async copyLastResult() {
    if (!this.lastGenerationResult) {
      this.showNotification('No Result', 'No availability data to copy');
      return;
    }
    
    try {
      await this.copyToClipboard(this.lastGenerationResult.formats.html);
      this.showNotification('Copied', 'Previous availability copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);
      this.showNotification('Copy Failed', 'Failed to copy to clipboard');
    }
  }
  
  async copyToClipboard(html) {
    const { clipboard } = require('electron');
    clipboard.writeHTML(html);
  }
  
  toggleMainWindow() {
    if (this.app.mainWindow && !this.app.mainWindow.isDestroyed()) {
      if (this.app.mainWindow.isVisible()) {
        this.app.mainWindow.hide();
      } else {
        this.app.mainWindow.show();
        this.app.mainWindow.focus();
      }
    } else {
      this.app.showMainWindow();
    }
  }
  
  openSettings() {
    // For now, just show main window
    // TODO: Implement dedicated settings window or overlay
    this.app.showMainWindow();
    
    // Send message to renderer to open settings
    if (this.app.mainWindow && !this.app.mainWindow.isDestroyed()) {
      this.app.mainWindow.webContents.send('open-settings');
    }
  }
  
  openHelp() {
    const { shell } = require('electron');
    shell.openExternal('https://github.com/freebusy-desktop/help');
  }
  
  quitApp() {
    const { app } = require('electron');
    app.quit();
  }
  
  updateMenuState() {
    // Rebuild menu with current state
    this.setupMenu();
  }
  
  setTrayIcon(state) {
    // TODO: Implement different icon states
    // For now, just change tooltip
    switch (state) {
      case 'generating':
        this.tray.setToolTip('FreeBusy - Generating availability...');
        break;
      case 'success':
        this.tray.setToolTip('FreeBusy - Availability generated ✓');
        break;
      case 'error':
        this.tray.setToolTip('FreeBusy - Generation failed ✗');
        break;
      default:
        this.tray.setToolTip('FreeBusy - Calendar Availability');
        break;
    }
  }
  
  showNotification(title, body, options = {}) {
    try {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body,
          silent: options.silent || false,
          ...options
        });
        
        notification.show();
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
  
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
  
  // Register global shortcuts
  registerGlobalShortcuts() {
    const { globalShortcut } = require('electron');
    
    try {
      // Register Cmd+Shift+G for quick generation
      globalShortcut.register('CommandOrControl+Shift+G', () => {
        this.quickGenerate();
      });
      
      console.log('Global shortcuts registered');
    } catch (error) {
      console.error('Failed to register global shortcuts:', error);
    }
  }
  
  unregisterGlobalShortcuts() {
    const { globalShortcut } = require('electron');
    globalShortcut.unregisterAll();
  }
}

module.exports = MenuBarManager;