class SettingsManager {
  constructor(store) {
    this.store = store;
    this.defaultSettings = {
      version: '1.0.0',
      personal: {
        email: '',
        meetingTitle: 'Meeting',
        zoomLink: '',
        meetingDescription: ''
      },
      schedule: {
        businessHoursStart: 9,
        businessHoursEnd: 17,
        meetingDurationMinutes: 30,
        defaultDateRangeDays: 3,
        includeWeekends: {
          saturday: false,
          sunday: false
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      behavior: {
        autoCopyToClipboard: true,
        minimizeAfterCopy: true,
        showDesktopNotifications: true,
        startWithSystem: false,
        calendarRefreshIntervalMinutes: 15,
        cacheCalendarData: true
      },
      app: {
        firstRun: true,
        onboardingCompleted: false,
        setupWizardShown: false
      },
      window: {
        position: { x: 100, y: 100 },
        size: { width: 720, height: 480 },
        minimizeToTray: true
      },
      lastModified: new Date().toISOString()
    };
  }
  
  getSettings() {
    try {
      const settings = this.store.get('settings', this.defaultSettings);
      
      // Ensure all default properties exist (for backwards compatibility)
      const mergedSettings = this.mergeWithDefaults(settings);
      
      return mergedSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.defaultSettings;
    }
  }
  
  saveSettings(settings) {
    try {
      // Validate settings structure
      const validatedSettings = this.validateSettings(settings);
      
      // Update last modified timestamp
      validatedSettings.lastModified = new Date().toISOString();
      
      // Save to store
      this.store.set('settings', validatedSettings);
      
      console.log('Settings saved successfully');
      return { success: true, settings: validatedSettings };
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error(`Settings save failed: ${error.message}`);
    }
  }
  
  resetSettings() {
    try {
      this.store.set('settings', this.defaultSettings);
      console.log('Settings reset to defaults');
      return this.defaultSettings;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw new Error(`Settings reset failed: ${error.message}`);
    }
  }
  
  getSetting(path) {
    try {
      const settings = this.getSettings();
      return this.getNestedValue(settings, path);
    } catch (error) {
      console.error(`Failed to get setting ${path}:`, error);
      return null;
    }
  }
  
  setSetting(path, value) {
    try {
      const settings = this.getSettings();
      this.setNestedValue(settings, path, value);
      return this.saveSettings(settings);
    } catch (error) {
      console.error(`Failed to set setting ${path}:`, error);
      throw error;
    }
  }
  
  validateSettings(settings) {
    const validated = { ...settings };
    
    // Validate personal settings
    if (validated.personal) {
      if (validated.personal.email && !this.isValidEmail(validated.personal.email)) {
        throw new Error('Invalid email address');
      }
      
      if (validated.personal.zoomLink && !this.isValidUrl(validated.personal.zoomLink)) {
        throw new Error('Invalid Zoom link URL');
      }
    }
    
    // Validate schedule settings
    if (validated.schedule) {
      const { businessHoursStart, businessHoursEnd, meetingDurationMinutes } = validated.schedule;
      
      if (businessHoursStart >= businessHoursEnd) {
        throw new Error('Business hours start must be before end time');
      }
      
      if (businessHoursStart < 0 || businessHoursStart > 23) {
        throw new Error('Business hours start must be between 0 and 23');
      }
      
      if (businessHoursEnd < 1 || businessHoursEnd > 24) {
        throw new Error('Business hours end must be between 1 and 24');
      }
      
      const validDurations = [15, 30, 45, 60];
      if (!validDurations.includes(meetingDurationMinutes)) {
        throw new Error('Meeting duration must be 15, 30, 45, or 60 minutes');
      }
      
      if (validated.schedule.defaultDateRangeDays < 1 || validated.schedule.defaultDateRangeDays > 30) {
        throw new Error('Date range must be between 1 and 30 days');
      }
    }
    
    // Validate behavior settings
    if (validated.behavior) {
      const interval = validated.behavior.calendarRefreshIntervalMinutes;
      const validIntervals = [5, 15, 30, 60];
      if (!validIntervals.includes(interval)) {
        throw new Error('Calendar refresh interval must be 5, 15, 30, or 60 minutes');
      }
    }
    
    return validated;
  }
  
  mergeWithDefaults(settings) {
    const merged = { ...this.defaultSettings };
    
    // Deep merge each section
    if (settings.personal) {
      merged.personal = { ...merged.personal, ...settings.personal };
    }
    
    if (settings.schedule) {
      merged.schedule = { ...merged.schedule, ...settings.schedule };
      if (settings.schedule.includeWeekends) {
        merged.schedule.includeWeekends = { ...merged.schedule.includeWeekends, ...settings.schedule.includeWeekends };
      }
    }
    
    if (settings.behavior) {
      merged.behavior = { ...merged.behavior, ...settings.behavior };
    }
    
    if (settings.window) {
      merged.window = { ...merged.window, ...settings.window };
      if (settings.window.position) {
        merged.window.position = { ...merged.window.position, ...settings.window.position };
      }
      if (settings.window.size) {
        merged.window.size = { ...merged.window.size, ...settings.window.size };
      }
    }
    
    // Keep version and lastModified from settings if present
    if (settings.version) merged.version = settings.version;
    if (settings.lastModified) merged.lastModified = settings.lastModified;
    
    return merged;
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // First-run detection and onboarding methods
  isFirstRun() {
    try {
      const settings = this.getSettings();
      return settings.app?.firstRun === true;
    } catch (error) {
      console.error('Failed to check first run status:', error);
      return true; // Default to first run on error
    }
  }
  
  markFirstRunCompleted() {
    try {
      this.setSetting('app.firstRun', false);
      this.setSetting('app.setupWizardShown', true);
    } catch (error) {
      console.error('Failed to mark first run as completed:', error);
    }
  }
  
  markOnboardingCompleted() {
    try {
      this.setSetting('app.onboardingCompleted', true);
      this.markFirstRunCompleted();
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
    }
  }
  
  shouldShowOnboarding() {
    try {
      const settings = this.getSettings();
      return settings.app?.firstRun === true || settings.app?.onboardingCompleted !== true;
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return true; // Default to showing onboarding on error
    }
  }
  
  exportSettings() {
    try {
      const settings = this.getSettings();
      const exportData = {
        ...settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw new Error(`Settings export failed: ${error.message}`);
    }
  }
  
  importSettings(settingsJson) {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate imported settings
      const validatedSettings = this.validateSettings(importedSettings);
      
      // Save imported settings
      return this.saveSettings(validatedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error(`Settings import failed: ${error.message}`);
    }
  }
}

module.exports = SettingsManager;