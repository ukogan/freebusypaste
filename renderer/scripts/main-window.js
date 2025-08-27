class FreeBusyMainWindow {
  constructor() {
    this.isAuthenticated = false;
    this.currentAvailability = null;
    this.currentSettings = null;
    
    this.init();
  }
  
  async init() {
    this.setupEventListeners();
    this.setupElectronListeners();
    await this.checkDemoMode();
    await this.checkAuthStatus();
    await this.loadSettings();
    this.updateUI();
  }
  
  setupEventListeners() {
    // Authentication
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    
    // Generation
    document.getElementById('generateBtn').addEventListener('click', () => this.generateAvailability());
    
    // Clipboard actions
    document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveToFile());
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
    document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
    document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettings());
    
    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    
    // Error handling
    document.getElementById('retryBtn').addEventListener('click', () => this.retry());
    document.getElementById('dismissErrorBtn').addEventListener('click', () => this.dismissError());
    
    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => this.refresh());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }
  
  setupElectronListeners() {
    if (window.electronAPI) {
      // Listen for availability generated
      window.electronAPI.on('availability-generated', (event, availability) => {
        this.handleAvailabilityGenerated(availability);
      });
      
      // Listen for auth status changes
      window.electronAPI.on('auth-status-changed', (event, isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.updateUI();
      });
      
      // Listen for errors
      window.electronAPI.on('error-occurred', (event, error) => {
        this.showError(error.title || 'Error', error.message);
      });
      
      // Listen for settings open request
      window.electronAPI.on('open-settings', () => {
        this.openSettings();
      });
    }
  }
  
  async checkDemoMode() {
    try {
      this.isDemoMode = await window.electronAPI.app.isDemoMode();
      if (this.isDemoMode) {
        document.getElementById('demoMode').style.display = 'inline';
        console.log('🎭 Demo mode enabled');
      }
    } catch (error) {
      console.error('Failed to check demo mode:', error);
      this.isDemoMode = false;
    }
  }
  
  async checkAuthStatus() {
    try {
      this.isAuthenticated = await window.electronAPI.auth.checkStatus();
    } catch (error) {
      console.error('Failed to check auth status:', error);
      this.isAuthenticated = false;
    }
  }
  
  async loadSettings() {
    try {
      this.currentSettings = await window.electronAPI.settings.get();
      this.populateSettingsForm();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
  
  async login() {
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    
    try {
      loginBtn.textContent = 'Connecting...';
      loginBtn.disabled = true;
      
      const result = await window.electronAPI.auth.login();
      
      if (result.success) {
        this.isAuthenticated = true;
        this.updateUI();
        this.showSuccess('Connected to Google Calendar successfully!');
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      this.showError('Authentication Failed', error.message);
      
    } finally {
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
    }
  }
  
  async generateAvailability() {
    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn.textContent;
    
    try {
      generateBtn.innerHTML = '<span class="spinner"></span> Checking calendar...';
      generateBtn.disabled = true;
      generateBtn.classList.add('loading');
      
      // Get generation options from settings
      const options = this.getGenerationOptions();
      
      const result = await window.electronAPI.availability.generate(options);
      
      if (result.success) {
        this.currentAvailability = result.data;
        this.displayAvailability(result.data);
        
        // Auto-copy if enabled
        if (this.currentSettings?.behavior?.autoCopyToClipboard) {
          await this.copyToClipboard(true);
        }
        
        generateBtn.innerHTML = '✅ Generated!';
        generateBtn.classList.remove('loading');
        generateBtn.classList.add('success');
        
        // Update last update time
        this.updateLastUpdateTime();
        
        setTimeout(() => {
          generateBtn.innerHTML = originalText;
          generateBtn.classList.remove('success');
          generateBtn.disabled = false;
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Generation failed');
      }
      
    } catch (error) {
      console.error('Generation failed:', error);
      this.showError('Generation Failed', error.message);
      
      generateBtn.innerHTML = originalText;
      generateBtn.classList.remove('loading');
      generateBtn.disabled = false;
    }
  }
  
  getGenerationOptions() {
    if (!this.currentSettings) return {};
    
    return {
      ...this.currentSettings.personal,
      ...this.currentSettings.schedule
    };
  }
  
  displayAvailability(availability) {
    const display = document.getElementById('availabilityDisplay');
    const resultsSection = document.getElementById('resultsSection');
    
    // Create HTML table
    let html = '<table class="availability-table"><thead><tr><th>Time</th>';
    
    // Add date headers
    availability.availability.forEach(day => {
      html += `<th><strong>${day.dateFormatted}</strong></th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Get all unique times
    const allTimes = [...new Set(availability.availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort();
    
    // Create rows
    allTimes.forEach(time => {
      html += `<tr><td><strong>${time}</strong></td>`;
      availability.availability.forEach(day => {
        const slot = day.slots.find(s => s.timeFormatted === time);
        if (slot && slot.available) {
          html += '<td><span class="book-link">AVAILABLE</span></td>';
        } else {
          html += '<td><span class="unavailable">—</span></td>';
        }
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    // Add meeting details
    const details = availability.meetingDetails;
    html += '<div class="meeting-details">';
    html += `<p><strong>Meeting:</strong> ${details.title}</p>`;
    if (details.zoomLink) {
      html += `<p><strong>Zoom:</strong> <a href="#" onclick="window.electronAPI.openExternal('${details.zoomLink}')">${details.zoomLink}</a></p>`;
    }
    if (details.attendeeEmail) {
      html += `<p><strong>Attendee:</strong> ${details.attendeeEmail}</p>`;
    }
    html += '</div>';
    
    display.innerHTML = html;
    resultsSection.style.display = 'flex';
  }
  
  async copyToClipboard(silent = false) {
    if (!this.currentAvailability) return;
    
    const copyBtn = document.getElementById('copyBtn');
    const successMsg = document.getElementById('successMessage');
    const originalText = copyBtn.textContent;
    
    try {
      // Use the markdown format for clipboard
      const textToCopy = this.currentAvailability.formats.markdown;
      
      // Copy to clipboard using Electron's clipboard
      await navigator.clipboard.writeText(textToCopy);
      
      if (!silent) {
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.classList.add('success');
        successMsg.style.display = 'block';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('success');
          successMsg.style.display = 'none';
        }, 3000);
      }
      
    } catch (error) {
      console.error('Copy failed:', error);
      if (!silent) {
        this.showError('Copy Failed', 'Failed to copy to clipboard');
      }
    }
  }
  
  saveToFile() {
    // TODO: Implement file save dialog
    this.showError('Not Implemented', 'File saving will be implemented in a future update');
  }
  
  openSettings() {
    document.getElementById('settingsOverlay').style.display = 'flex';
    this.populateSettingsForm();
  }
  
  closeSettings() {
    document.getElementById('settingsOverlay').style.display = 'none';
  }
  
  populateSettingsForm() {
    if (!this.currentSettings) return;
    
    const settings = this.currentSettings;
    
    // Personal tab
    document.getElementById('email').value = settings.personal.email || '';
    document.getElementById('meetingTitle').value = settings.personal.meetingTitle || 'Meeting';
    document.getElementById('zoomLink').value = settings.personal.zoomLink || '';
    
    // Schedule tab
    document.getElementById('startTime').value = settings.schedule.businessHoursStart || 9;
    document.getElementById('endTime').value = settings.schedule.businessHoursEnd || 17;
    document.getElementById('meetingDuration').value = settings.schedule.meetingDurationMinutes || 30;
    document.getElementById('dateRange').value = settings.schedule.defaultDateRangeDays || 3;
    
    // Advanced tab
    document.getElementById('autoCopy').checked = settings.behavior.autoCopyToClipboard !== false;
    document.getElementById('minimizeAfterCopy').checked = settings.behavior.minimizeAfterCopy !== false;
    document.getElementById('showNotifications').checked = settings.behavior.showDesktopNotifications !== false;
  }
  
  async saveSettings() {
    try {
      const settingsToSave = {
        ...this.currentSettings,
        personal: {
          ...this.currentSettings.personal,
          email: document.getElementById('email').value,
          meetingTitle: document.getElementById('meetingTitle').value,
          zoomLink: document.getElementById('zoomLink').value
        },
        schedule: {
          ...this.currentSettings.schedule,
          businessHoursStart: parseInt(document.getElementById('startTime').value),
          businessHoursEnd: parseInt(document.getElementById('endTime').value),
          meetingDurationMinutes: parseInt(document.getElementById('meetingDuration').value),
          defaultDateRangeDays: parseInt(document.getElementById('dateRange').value)
        },
        behavior: {
          ...this.currentSettings.behavior,
          autoCopyToClipboard: document.getElementById('autoCopy').checked,
          minimizeAfterCopy: document.getElementById('minimizeAfterCopy').checked,
          showDesktopNotifications: document.getElementById('showNotifications').checked
        }
      };
      
      const result = await window.electronAPI.settings.save(settingsToSave);
      
      if (result.success) {
        this.currentSettings = result.settings;
        this.closeSettings();
        this.showSuccess('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showError('Save Failed', error.message);
    }
  }
  
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });
  }
  
  retry() {
    this.dismissError();
    if (this.isAuthenticated) {
      this.generateAvailability();
    } else {
      this.login();
    }
  }
  
  dismissError() {
    document.getElementById('errorSection').style.display = 'none';
    this.updateUI();
  }
  
  async refresh() {
    if (this.isAuthenticated) {
      await this.generateAvailability();
    } else {
      await this.checkAuthStatus();
      this.updateUI();
    }
  }
  
  handleKeyboard(e) {
    // Cmd+G or Ctrl+G for generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
      e.preventDefault();
      if (this.isAuthenticated) {
        this.generateAvailability();
      }
    }
    
    // Cmd+, or Ctrl+, for settings
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      this.openSettings();
    }
    
    // Escape to close settings
    if (e.key === 'Escape') {
      this.closeSettings();
    }
  }
  
  updateUI() {
    const authSection = document.getElementById('authSection');
    const generationSection = document.getElementById('generationSection');
    const authStatus = document.getElementById('authStatus');
    const errorSection = document.getElementById('errorSection');
    
    if (errorSection.style.display === 'flex') {
      // Don't change UI if error is showing
      return;
    }
    
    if (this.isAuthenticated) {
      authSection.style.display = 'none';
      generationSection.style.display = 'flex';
      authStatus.textContent = 'Connected to Google Calendar';
    } else {
      authSection.style.display = 'flex';
      generationSection.style.display = 'none';
      authStatus.textContent = 'Not connected';
    }
  }
  
  updateLastUpdateTime() {
    const lastUpdate = document.getElementById('lastUpdate');
    const now = new Date();
    lastUpdate.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  }
  
  showError(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'flex';
    
    // Hide other sections
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('generationSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
  }
  
  showSuccess(message) {
    // Simple success notification - could be enhanced with proper notifications
    console.log('Success:', message);
  }
  
  handleAvailabilityGenerated(availability) {
    this.currentAvailability = availability;
    this.displayAvailability(availability);
    this.updateLastUpdateTime();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FreeBusyMainWindow();
});