const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication API
  auth: {
    checkStatus: () => ipcRenderer.invoke('auth:check-status'),
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout')
  },
  
  // Settings API
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings)
  },
  
  // Availability generation API
  availability: {
    generate: (options) => ipcRenderer.invoke('availability:generate', options)
  },
  
  // Window management API
  window: {
    show: () => ipcRenderer.invoke('window:show'),
    hide: () => ipcRenderer.invoke('window:hide'),
    minimize: () => ipcRenderer.invoke('window:minimize')
  },
  
  // Clipboard API
  clipboard: {
    writeText: (text) => ipcRenderer.invoke('clipboard:write-text', text),
    readText: () => ipcRenderer.invoke('clipboard:read-text')
  },
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // App info
  app: {
    isDemoMode: () => ipcRenderer.invoke('app:is-demo-mode'),
    isFirstRun: () => ipcRenderer.invoke('app:is-first-run'),
    completeOnboarding: () => ipcRenderer.invoke('app:complete-onboarding')
  },
  
  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'availability-generated',
      'auth-status-changed',
      'error-occurred',
      'open-settings'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});