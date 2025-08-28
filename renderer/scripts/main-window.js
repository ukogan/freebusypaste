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
    
    // Check if this is first run
    const isFirstRun = await this.checkFirstRun();
    if (isFirstRun) {
      await this.showFirstRunOnboarding();
    }
    
    // Check for credentials before auth
    await this.checkCredentials();
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
    
    // Option card buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-button')) {
        this.handleOptionButtonClick(e.target);
      }
    });
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
      
      // Listen for credentials update
      window.electronAPI.on('credentials-updated', () => {
        this.checkCredentials();
        this.updateUI();
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
  
  async checkFirstRun() {
    try {
      return await window.electronAPI.app.isFirstRun();
    } catch (error) {
      console.error('Failed to check first run:', error);
      return false;
    }
  }
  
  async showFirstRunOnboarding() {
    // Simple first-run welcome message for now
    const welcomeMessage = `
      <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px; margin: 20px;">
        <h2>🎉 Welcome to FreeBusy!</h2>
        <p style="margin: 20px 0; color: #6c757d;">
          Generate your calendar availability in seconds. Let's get you set up!
        </p>
        <div style="margin: 20px 0;">
          ${this.isDemoMode ? 
            '<p><strong>Demo Mode:</strong> You can try all features without connecting to Google Calendar.</p>' :
            '<p>First, connect your Google Calendar to get started.</p>'
          }
        </div>
        <button id="startOnboarding" style="
          background: #007bff; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
        ">Get Started</button>
        <button id="skipOnboarding" style="
          background: transparent; 
          color: #6c757d; 
          border: 1px solid #dee2e6; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
          margin: 10px;
        ">Skip for now</button>
      </div>
    `;
    
    // Show welcome message
    const authSection = document.getElementById('authSection');
    authSection.innerHTML = welcomeMessage;
    
    // Handle onboarding buttons
    document.getElementById('startOnboarding').addEventListener('click', async () => {
      await this.completeOnboarding();
      location.reload(); // Reload to show normal interface
    });
    
    document.getElementById('skipOnboarding').addEventListener('click', async () => {
      await this.completeOnboarding();
      location.reload(); // Reload to show normal interface
    });
  }
  
  async completeOnboarding() {
    try {
      await window.electronAPI.app.completeOnboarding();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }
  
  async checkCredentials() {
    try {
      this.hasValidCredentials = await window.electronAPI.credentials.hasValid();
      if (!this.hasValidCredentials && !this.isDemoMode) {
        console.warn('⚠️ No valid Google credentials found');
      }
    } catch (error) {
      console.error('Failed to check credentials:', error);
      this.hasValidCredentials = false;
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
    // Check if credentials are needed first
    if (!this.hasValidCredentials && !this.isDemoMode) {
      this.showCredentialsSetup();
      return;
    }
    
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
      } else if (result.requiresCredentials) {
        this.showCredentialsSetup();
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

  showCredentialsSetup() {
    const authSection = document.getElementById('authSection');
    authSection.innerHTML = `
      <div class="auth-content">
        <div class="auth-icon">📄</div>
        <h2>Google Calendar Setup Required</h2>
        <p>To connect to Google Calendar, you need to upload your OAuth2 credentials file.</p>
        <div style="text-align: left; max-width: 400px; margin: 20px auto; background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #333;">Quick Setup:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
            <li>Visit <a href="#" onclick="window.electronAPI.openExternal('https://console.cloud.google.com')" style="color: #0066cc;">Google Cloud Console</a></li>
            <li>Create a project & enable Calendar API</li>
            <li>Create OAuth2 credentials (Desktop app)</li>
            <li>Download the JSON file</li>
            <li>Click "Upload Credentials" below</li>
          </ol>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn-primary" id="uploadCredentialsBtn">
            📄 Upload Credentials File
          </button>
          <button class="btn-secondary" id="viewInstructionsBtn">
            📖 View Full Instructions
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('uploadCredentialsBtn').addEventListener('click', () => this.uploadCredentials());
    document.getElementById('viewInstructionsBtn').addEventListener('click', () => this.showDetailedInstructions());
  }

  async uploadCredentials() {
    const uploadBtn = document.getElementById('uploadCredentialsBtn');
    const originalText = uploadBtn.textContent;
    
    try {
      uploadBtn.textContent = 'Uploading...';
      uploadBtn.disabled = true;
      
      const result = await window.electronAPI.credentials.uploadFile();
      
      if (result.success) {
        this.hasValidCredentials = true;
        this.showSuccess('Credentials uploaded successfully! You can now connect to Google Calendar.');
        // Refresh the auth section
        setTimeout(() => {
          this.updateUI();
        }, 2000);
      } else {
        if (result.error !== 'Upload cancelled') {
          this.showError('Upload Failed', result.error);
        }
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      this.showError('Upload Failed', error.message);
      
    } finally {
      uploadBtn.textContent = originalText;
      uploadBtn.disabled = false;
    }
  }

  showDetailedInstructions() {
    this.showError('Setup Instructions', `
      <div style="text-align: left;">
        <h4>Complete Setup Guide:</h4>
        <p>1. Go to <a href="#" onclick="window.electronAPI.openExternal('https://console.cloud.google.com')" style="color: #0066cc;">Google Cloud Console</a></p>
        <p>2. Create a new project or select existing one</p>
        <p>3. Enable the Google Calendar API</p>
        <p>4. Go to Credentials → Create OAuth2 Client ID</p>
        <p>5. Choose "Desktop Application" type</p>
        <p>6. Download the JSON credentials file</p>
        <p>7. Return here and click "Upload Credentials File"</p>
        <br>
        <p><small>Need help? Check the README file in the app folder for detailed screenshots.</small></p>
      </div>
    `);
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
    const options = {};
    
    if (this.currentSettings) {
      // Get base options from settings
      options.email = this.currentSettings.personal?.email || '';
      options.meetingTitle = this.currentSettings.personal?.meetingTitle || 'Meeting';
      options.zoomLink = this.currentSettings.personal?.zoomLink || '';
      options.businessHoursStart = this.currentSettings.schedule?.businessHoursStart || 9;
      options.businessHoursEnd = this.currentSettings.schedule?.businessHoursEnd || 17;
    }
    
    // Override with UI selections
    const selectedDuration = document.querySelector('[class*="duration-"].selected');
    const selectedDays = document.querySelector('[class*="days-"].selected');
    
    if (selectedDuration) {
      options.meetingDurationMinutes = parseInt(selectedDuration.dataset.value);
    } else {
      options.meetingDurationMinutes = 30; // Default
    }
    
    if (selectedDays) {
      options.dateRangeDays = parseInt(selectedDays.dataset.value);
    } else {
      options.dateRangeDays = 3; // Default
    }
    
    return options;
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
    
    // Get all unique times and sort them chronologically
    const allTimes = [...new Set(availability.availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort((a, b) => {
      // Convert to 24-hour format for proper sorting
      const timeA = this.parseTimeForSort(a);
      const timeB = this.parseTimeForSort(b);
      return timeA - timeB;
    });
    
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
      // Use the HTML format for email-friendly copying
      const htmlToCopy = this.currentAvailability.formats.html;
      
      // Use Electron's HTML clipboard API for proper email formatting
      await window.electronAPI.clipboard.writeHTML(htmlToCopy);
      
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
      
      // Auto-minimize if setting is enabled
      if (this.currentSettings?.behavior?.minimizeAfterCopy) {
        await window.electronAPI.window.minimize();
      }
      
    } catch (error) {
      console.error('Copy failed:', error);
      if (!silent) {
        this.showError('Copy Failed', 'Failed to copy to clipboard');
      }
    }
  }

  parseTimeForSort(timeStr) {
    // Convert "10 AM" or "2:30 PM" to 24-hour format for sorting
    const [time, period] = timeStr.split(' ');
    const [hour, minute = 0] = time.split(':').map(Number);
    let hour24 = hour;
    
    if (period === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minute; // Return total minutes for sorting
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
  
  handleOptionButtonClick(button) {
    // Remove selected class from siblings in the same card
    const cardButtons = button.parentNode;
    const siblings = cardButtons.children;
    for (let sibling of siblings) {
      sibling.classList.remove('selected');
    }
    
    // Add selected class to clicked button
    button.classList.add('selected');
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
    
    // In demo mode, skip credential checks
    if (this.isDemoMode) {
      if (this.isAuthenticated) {
        authSection.style.display = 'none';
        generationSection.style.display = 'flex';
        authStatus.textContent = 'Connected to Google Calendar (Demo)';
      } else {
        authSection.style.display = 'flex';
        generationSection.style.display = 'none';
        authStatus.textContent = 'Not connected (Demo)';
        // Show normal login UI for demo
        authSection.innerHTML = `
          <div class="auth-content">
            <div class="auth-icon">🔐</div>
            <h2>Connect to Google Calendar</h2>
            <p>Sign in with Google to access your calendar availability</p>
            <button class="btn-primary" id="loginBtn">
              Connect Google Calendar
            </button>
          </div>
        `;
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
      }
      return;
    }
    
    // Regular mode: check credentials first
    if (!this.hasValidCredentials) {
      authSection.style.display = 'flex';
      generationSection.style.display = 'none';
      authStatus.textContent = 'Setup required';
      // showCredentialsSetup will be called when user clicks login
      authSection.innerHTML = `
        <div class="auth-content">
          <div class="auth-icon">⚙️</div>
          <h2>Setup Required</h2>
          <p>Upload your Google OAuth2 credentials to get started</p>
          <button class="btn-primary" id="loginBtn">
            📄 Setup Google Calendar
          </button>
        </div>
      `;
      document.getElementById('loginBtn').addEventListener('click', () => this.login());
    } else if (this.isAuthenticated) {
      authSection.style.display = 'none';
      generationSection.style.display = 'flex';
      authStatus.textContent = 'Connected to Google Calendar';
    } else {
      authSection.style.display = 'flex';
      generationSection.style.display = 'none';
      authStatus.textContent = 'Not connected';
      // Show normal login UI when credentials are available
      authSection.innerHTML = `
        <div class="auth-content">
          <div class="auth-icon">🔐</div>
          <h2>Connect to Google Calendar</h2>
          <p>Sign in with Google to access your calendar availability</p>
          <button class="btn-primary" id="loginBtn">
            Connect Google Calendar
          </button>
        </div>
      `;
      document.getElementById('loginBtn').addEventListener('click', () => this.login());
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