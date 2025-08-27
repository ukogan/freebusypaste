# FreeBusy Desktop - Technical Architecture Specification

**Architecture Change Counter: 1**

## System Overview

FreeBusy Desktop is a macOS-native Electron application that transforms calendar availability checking from a CLI tool to a professional, user-friendly desktop experience with menu bar integration and one-click functionality.

## Technology Stack (LOCKED)

### Core Framework
- **Runtime**: Node.js 18.x LTS
- **Desktop Framework**: Electron 27.x
- **Language**: JavaScript (ES2022)
- **Process Architecture**: Multi-process (main + renderer)

### Google Integration
- **Calendar API**: Google Calendar API v3
- **Authentication**: OAuth 2.0 with googleapis client library
- **API Client**: googleapis npm package (latest stable)

### Security & Storage  
- **Token Storage**: macOS Keychain via keytar package
- **Settings Storage**: electron-store for user preferences
- **Encryption**: Built-in macOS keychain encryption

### System Integration
- **Menu Bar**: Electron tray API (macOS menu bar)
- **Notifications**: macOS Notification Center
- **Clipboard**: Electron clipboard API
- **Auto-start**: macOS Login Items

### Development Tools
- **Build System**: electron-builder for packaging
- **Testing**: Jest for unit tests, Playwright for E2E
- **Linting**: ESLint with standard configuration
- **Hot Reload**: electron-reload for development

## Architecture Principles

### Security-First Design
- Read-only calendar access (no event creation/modification)
- OAuth tokens stored in OS keychain only
- No sensitive data in application files
- Minimal data retention (cache expires after 1 hour)

### Privacy-by-Design
- No tracking or analytics
- All data stored locally
- No third-party services beyond Google Calendar
- Clear user consent for all data access

### macOS-Native Integration
- Single platform focus for refined user experience
- Deep macOS system integration (Keychain, Notification Center, Menu Bar)
- Native macOS UI patterns and conventions
- Optimized for macOS performance and security

## Process Architecture

### Main Process (main.js)
**Responsibilities**:
- Application lifecycle management
- macOS menu bar integration and menu
- Window management and IPC coordination
- OAuth flow initiation and token management
- Google Calendar API calls and data processing
- Settings persistence and configuration management

**Key Modules**:
```
main/
├── app.js              # Application initialization
├── auth/
│   ├── oauth-manager.js     # OAuth flow handling
│   └── token-manager.js     # Token storage/refresh
├── calendar/
│   ├── api-client.js        # Google Calendar API wrapper
│   └── availability-generator.js # Core availability logic
├── system/
│   ├── menubar-manager.js   # macOS menu bar integration
│   └── shortcuts-manager.js # Global keyboard shortcuts
└── storage/
    ├── settings-manager.js  # User settings persistence
    └── cache-manager.js     # Availability data caching
```

### Renderer Process (renderer.js)
**Responsibilities**:
- User interface rendering and interaction
- Settings form validation and submission
- Availability table display and formatting
- Onboarding wizard flow management
- Error display and user feedback

**Key Components**:
```
renderer/
├── views/
│   ├── main-window.js       # Main availability generation UI
│   ├── settings-panel.js    # 4-tab settings interface
│   ├── onboarding-wizard.js # First-run setup flow
│   └── error-handler.js     # Error display and recovery
├── components/
│   ├── availability-table.js # Availability display component
│   ├── loading-spinner.js    # Loading state component
│   └── form-validator.js     # Client-side validation
└── utils/
    ├── clipboard-manager.js  # Clipboard operations
    └── format-helpers.js     # Table formatting utilities
```

## Data Flow Architecture

### Availability Generation Flow
```
User Input → Settings Validation → OAuth Check → Calendar API Query → 
Busy Time Processing → Slot Generation → Table Formatting → 
Clipboard Copy → User Feedback
```

### Detailed Flow Steps
1. **User Interaction**: Button click, tray menu, or keyboard shortcut
2. **Authentication Check**: Verify OAuth tokens, refresh if needed
3. **Configuration Loading**: Get user settings (business hours, meeting details)
4. **Date Range Calculation**: Determine availability window based on settings
5. **Calendar Query**: Google Calendar freebusy API call
6. **Data Processing**: Parse busy times and generate available slots
7. **Table Generation**: Create formatted availability table
8. **Clipboard Integration**: Copy table to system clipboard
9. **User Notification**: Success message via desktop notification or UI

### Error Handling Flow
```
Error Detection → Error Classification → User Notification → 
Recovery Options → Retry Logic → Fallback Mode
```

## Security Architecture

### OAuth 2.0 Implementation
```javascript
// OAuth Configuration
const OAUTH_CONFIG = {
  clientId: 'google-client-id',
  clientSecret: 'google-client-secret', 
  redirectUri: 'http://localhost:8080/oauth/callback',
  scope: 'https://www.googleapis.com/auth/calendar.readonly'
};
```

### Token Storage Strategy
- **Primary**: OS keychain (keytar) for production
- **Development**: Encrypted file storage with master password
- **Token Refresh**: Automatic refresh 5 minutes before expiry
- **Token Revocation**: Clear tokens on authentication errors

### Data Encryption
- **At Rest**: OS keychain handles encryption
- **In Transit**: HTTPS for all API communications
- **In Memory**: Tokens cleared after use
- **Settings**: Plain text (non-sensitive configuration only)

## API Integration Architecture

### Google Calendar API Usage
```javascript
// Primary API Calls
calendar.freebusy.query({
  timeMin: startDate,
  timeMax: endDate,
  items: [{id: 'primary'}]
});

calendar.calendarList.list({
  minAccessRole: 'freeBusyReader'
});
```

### Rate Limiting Strategy
- **Request Caching**: 15-minute cache for availability data
- **Batch Queries**: Combine multiple date ranges where possible
- **Exponential Backoff**: Progressive delays on rate limit errors
- **Queue Management**: Single active request per user action

### Error Handling
- **Network Errors**: Retry with exponential backoff
- **Authentication Errors**: Force re-authentication flow
- **Rate Limit Errors**: Show user-friendly delay message
- **API Errors**: Graceful degradation with cached data

## User Interface Architecture

### Window Management
```javascript
// Main Window Configuration
const mainWindow = new BrowserWindow({
  width: 720,
  height: 480,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### macOS Menu Bar Integration
```javascript
// Menu Bar Tray Structure
const trayMenu = Menu.buildFromTemplate([
  { label: '⚡ Quick Generate', click: quickGenerate },
  { label: '📋 Copy Last Result', click: copyLastResult },
  { type: 'separator' },
  { label: '🏠 Show App', click: showMainWindow },
  { label: '⚙️ Settings', click: openSettings },
  { type: 'separator' },
  { label: '❌ Quit FreeBusy', click: quitApp }
]);
```

### IPC Communication Architecture
```javascript
// Main → Renderer Communication
mainWindow.webContents.send('availability-generated', availabilityData);
mainWindow.webContents.send('auth-status-changed', isAuthenticated);
mainWindow.webContents.send('error-occurred', errorDetails);

// Renderer → Main Communication  
ipcRenderer.invoke('generate-availability', userSettings);
ipcRenderer.invoke('authenticate-user', credentials);
ipcRenderer.invoke('save-settings', settingsData);
```

## Storage Architecture

### File System Layout
```
~/.freebusy-desktop/
├── settings.json           # User preferences
├── cache/
│   └── availability.json   # Cached availability data
└── logs/
    └── app.log            # Application logs (debug mode only)

macOS Keychain:
└── freebusy-desktop       # OAuth tokens (encrypted)
```

### Configuration Schema
```javascript
// settings.json structure
{
  version: '1.0.0',
  personal: { email, meetingTitle, zoomLink, meetingDescription },
  schedule: { businessHours, meetingDuration, dateRange, weekends },
  behavior: { autoCopy, notifications, startWithSystem, refreshInterval },
  window: { position, size, minimizeToTray }
}
```

### Cache Management
- **Cache Duration**: 15 minutes default, configurable
- **Cache Size**: Maximum 100 entries
- **Cache Cleanup**: Automatic cleanup on startup
- **Cache Format**: JSON with metadata and expiry timestamps

## Build & Deployment Architecture

### Development Environment
```json
{
  "scripts": {
    "dev": "electron-reload . && electron main.js",
    "test": "jest",
    "lint": "eslint src/",
    "build": "electron-builder"
  }
}
```

### Build Configuration (electron-builder)
```javascript
{
  appId: 'com.freebusy.desktop',
  productName: 'FreeBusy Desktop',
  directories: {
    output: 'dist'
  },
  files: ['main/**/*', 'renderer/**/*', 'package.json'],
  mac: {
    category: 'public.app-category.productivity'
  },
  win: {
    target: 'nsis'
  },
  linux: {
    target: 'AppImage'
  }
}
```

### Package Distribution
- **macOS**: DMG installer with code signing and notarization
- **App Store**: Mac App Store distribution (future consideration)
- **Auto-update**: electron-updater with staged rollouts
- **Homebrew**: Cask distribution for developers

## Performance Architecture

### Memory Management
- **Target RAM Usage**: <150MB
- **Cache Limits**: 100 availability generations max
- **Token Cleanup**: Clear expired tokens weekly
- **Background Processing**: Minimize main thread blocking

### Startup Performance
- **Target Startup Time**: <3 seconds
- **Lazy Loading**: Load UI components on demand
- **Preload Scripts**: Minimal preload for security
- **Background Tasks**: Defer non-critical initialization

### Response Time Targets
- **Availability Generation**: <5 seconds
- **Settings Panel**: <500ms to open
- **System Tray Actions**: <200ms response
- **UI Interactions**: <100ms feedback

## Testing Architecture

### Unit Testing Strategy
```javascript
// Test Coverage Targets
main/: 85% coverage
renderer/: 80% coverage 
integration/: 70% coverage
```

### Testing Tools & Framework
- **Unit Tests**: Jest with electron-mock
- **E2E Tests**: Playwright with electron support
- **API Testing**: Mock Google Calendar API responses
- **macOS Testing**: GitHub Actions with macOS runners

### Test Structure
```
tests/
├── unit/
│   ├── auth.test.js
│   ├── calendar-api.test.js
│   └── availability-generator.test.js
├── integration/
│   ├── oauth-flow.test.js
│   └── settings-persistence.test.js
└── e2e/
    ├── onboarding.test.js
    ├── availability-generation.test.js
    └── menubar.test.js
```

## Monitoring & Logging Architecture

### Error Tracking
- **Error Boundaries**: React-style error catching
- **Crash Reporting**: Electron crashReporter for production
- **User Feedback**: In-app error reporting form
- **Log Rotation**: 7-day log retention maximum

### Performance Monitoring
- **Resource Usage**: Track memory/CPU in development
- **API Performance**: Monitor Google Calendar API response times
- **User Actions**: Track feature usage (locally only)
- **Error Rates**: Monitor authentication and generation failures

### Privacy-Safe Analytics
- **Local Only**: No data sent to external services
- **User Consent**: Optional usage statistics sharing
- **Anonymization**: Remove all personally identifiable information
- **Opt-out**: Easy disable in settings

## Future Architecture Considerations

### Scalability Planning
- **Multi-account Support**: Database migration path (SQLite)
- **Calendar Providers**: Plugin architecture for non-Google calendars
- **Team Features**: Shared availability for organizations
- **API Expansion**: Support for calendar creation/modification

### Technology Evolution
- **Electron Alternatives**: Monitor Tauri, native app frameworks
- **Node.js Updates**: Plan for major version migrations
- **Google API Changes**: Monitor deprecations and new features
- **Security Standards**: Keep up with OAuth 2.1, security best practices

---

**Architecture Lock Status**: LOCKED  
**Required for Changes**: Explicit architecture change discussion  
**Last Updated**: 2025-08-27  
**Change Counter**: 1 (Notification at 5 changes)