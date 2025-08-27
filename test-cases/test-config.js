// test-config.js - Centralized test configuration for FreeBusy Desktop

module.exports = {
  // Jest configuration for unit tests
  jest: {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/test-cases/setup/jest-setup.js'],
    testMatch: [
      '<rootDir>/test-cases/jest-unit-tests/**/*.test.js'
    ],
    collectCoverageFrom: [
      'src/main/**/*.js',
      'src/renderer/**/*.js',
      '!src/**/*.test.js',
      '!src/**/__tests__/**',
      '!src/main/main.js' // Exclude electron main entry point
    ],
    coverageThreshold: {
      global: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@tests/(.*)$': '<rootDir>/test-cases/$1'
    }
  },

  // Playwright configuration for E2E tests
  playwright: {
    testDir: './test-cases/playwright-tests',
    timeout: 30000,
    expect: {
      timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
      actionTimeout: 0,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    },
    projects: [
      {
        name: 'electron-main',
        testMatch: /.*\.electron\.test\.js/,
        use: {
          browserName: 'chromium',
          launchOptions: {
            executablePath: require('electron')
          }
        }
      },
      {
        name: 'oauth-browser',
        testMatch: /.*oauth.*\.test\.js/,
        use: {
          browserName: 'chromium',
          viewport: { width: 1280, height: 720 }
        }
      }
    ]
  },

  // Test data configuration
  testData: {
    // Google Calendar test events
    calendarEvents: {
      typical: [
        {
          start: { dateTime: '2025-08-27T17:00:00Z' }, // 10:00 AM PDT
          end: { dateTime: '2025-08-27T18:00:00Z' }    // 11:00 AM PDT
        },
        {
          start: { dateTime: '2025-08-27T21:00:00Z' }, // 2:00 PM PDT
          end: { dateTime: '2025-08-27T22:30:00Z' }    // 3:30 PM PDT
        }
      ],
      
      fullyBooked: [
        {
          start: { dateTime: '2025-08-27T16:00:00Z' }, // 9:00 AM PDT
          end: { dateTime: '2025-08-28T01:00:00Z' }    // 6:00 PM PDT
        }
      ],
      
      empty: [],
      
      allDay: [
        {
          start: { date: '2025-08-27' },
          end: { date: '2025-08-28' }
        }
      ],
      
      outsideHours: [
        {
          start: { dateTime: '2025-08-27T13:00:00Z' }, // 6:00 AM PDT
          end: { dateTime: '2025-08-27T14:00:00Z' }    // 7:00 AM PDT
        },
        {
          start: { dateTime: '2025-08-28T02:00:00Z' }, // 7:00 PM PDT
          end: { dateTime: '2025-08-28T03:00:00Z' }    // 8:00 PM PDT
        }
      ]
    },

    // User settings variations for testing
    userSettings: {
      default: {
        businessHours: { start: 9, end: 18 },
        meetingDuration: 30,
        dateRange: 3,
        includeWeekends: false,
        personal: {
          email: 'test@example.com',
          meetingTitle: 'Meeting with Test User',
          zoomLink: 'https://zoom.us/j/123456789',
          meetingDescription: 'Looking forward to our discussion!'
        },
        behavior: {
          autoCopy: true,
          minimizeAfterCopy: true,
          notifications: true,
          startWithSystem: false,
          refreshInterval: 15
        }
      },

      powerUser: {
        businessHours: { start: 8, end: 20 },
        meetingDuration: 15,
        dateRange: 7,
        includeWeekends: true,
        personal: {
          email: 'power@user.com',
          meetingTitle: 'Quick Sync',
          zoomLink: 'https://zoom.us/j/987654321'
        },
        behavior: {
          autoCopy: true,
          minimizeAfterCopy: true,
          notifications: true,
          startWithSystem: true,
          refreshInterval: 5
        }
      },

      conservative: {
        businessHours: { start: 10, end: 16 },
        meetingDuration: 60,
        dateRange: 5,
        includeWeekends: false,
        personal: {
          email: 'conservative@company.com',
          meetingTitle: 'Meeting with Conservative User',
          zoomLink: 'https://teams.microsoft.com/l/meetup-join/...'
        },
        behavior: {
          autoCopy: false,
          minimizeAfterCopy: false,
          notifications: false,
          startWithSystem: false,
          refreshInterval: 30
        }
      }
    },

    // OAuth test configurations
    oauth: {
      success: {
        access_token: 'mock_access_token_12345',
        refresh_token: 'mock_refresh_token_67890',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      },

      expired: {
        access_token: 'expired_access_token',
        refresh_token: 'valid_refresh_token',
        expires_in: -3600,
        token_type: 'Bearer'
      },

      invalid: {
        error: 'invalid_grant',
        error_description: 'The provided authorization code is invalid.'
      }
    },

    // Expected clipboard formats
    clipboardFormats: {
      standard: `Available Times - Aug 27-29, 2025

Time        Wed 8/27    Thu 8/28    Fri 8/29
9:00 AM     [BOOK]      [BOOK]      [BOOK]
9:30 AM     [BOOK]      —           [BOOK]
10:00 AM    —           [BOOK]      [BOOK]

Meeting: Meeting with Test User
Zoom: https://zoom.us/j/123456789
Contact: test@example.com`,

      empty: `Available Times - Aug 27-29, 2025

Great! You have full availability for the selected period.

Meeting: Meeting with Test User  
Zoom: https://zoom.us/j/123456789
Contact: test@example.com`,

      fullyBooked: `Available Times - Aug 27-29, 2025

No availability found for the selected period.
Try a different date range or adjust your business hours.

Meeting: Meeting with Test User
Contact: test@example.com`
    }
  },

  // Performance benchmarks
  performance: {
    targets: {
      appStartup: 3000,        // 3 seconds
      authFlow: 30000,         // 30 seconds
      availabilityGeneration: 5000,  // 5 seconds
      clipboardCopy: 1000,     // 1 second
      settingsPanel: 500,      // 500ms
      menuBarResponse: 200     // 200ms
    },
    
    resources: {
      maxMemoryUsage: 150 * 1024 * 1024,  // 150MB
      maxCPUUsage: 50,         // 50% during generation
      maxDiskUsage: 50 * 1024 * 1024      // 50MB cache
    }
  },

  // Error scenarios for testing
  errorScenarios: {
    network: {
      offline: { code: 'NETWORK_ERROR', message: 'No internet connection' },
      timeout: { code: 'TIMEOUT', message: 'Request timed out' },
      dns: { code: 'DNS_ERROR', message: 'DNS resolution failed' }
    },
    
    auth: {
      expired: { code: 401, message: 'Token expired' },
      invalid: { code: 401, message: 'Invalid credentials' },
      denied: { code: 403, message: 'Access denied' },
      rateLimited: { code: 429, message: 'Rate limit exceeded' }
    },
    
    api: {
      serverError: { code: 500, message: 'Internal server error' },
      unavailable: { code: 503, message: 'Service unavailable' },
      badRequest: { code: 400, message: 'Bad request' }
    },
    
    system: {
      keychainLocked: { code: 'KEYCHAIN_LOCKED', message: 'Keychain is locked' },
      permissionDenied: { code: 'PERMISSION_DENIED', message: 'Permission denied' },
      diskFull: { code: 'DISK_FULL', message: 'Disk full' }
    }
  },

  // Browser configurations for OAuth testing
  browsers: {
    safari: {
      name: 'Safari',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
    },
    chrome: {
      name: 'Chrome',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    },
    firefox: {
      name: 'Firefox',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0'
    }
  },

  // Test environment configurations
  environments: {
    development: {
      googleApiEndpoint: 'https://www.googleapis.com',
      oauthRedirectUri: 'http://localhost:8080/oauth/callback',
      logLevel: 'debug',
      enableMocking: true
    },
    
    staging: {
      googleApiEndpoint: 'https://www.googleapis.com',
      oauthRedirectUri: 'http://localhost:8080/oauth/callback',
      logLevel: 'info',
      enableMocking: false
    },
    
    production: {
      googleApiEndpoint: 'https://www.googleapis.com',
      oauthRedirectUri: 'freebusy://oauth/callback',
      logLevel: 'error',
      enableMocking: false
    }
  },

  // CI/CD configuration
  ci: {
    retries: 3,
    timeout: 60000,
    parallel: true,
    coverage: {
      enabled: true,
      threshold: 75
    },
    
    artifacts: {
      screenshots: true,
      videos: true,
      traces: true,
      logs: true
    },

    // GitHub Actions specific
    github: {
      os: 'macos-latest',
      nodeVersion: '18',
      electronVersion: '27',
      cacheDependencies: true
    }
  }
};

// Helper functions for tests
const testHelpers = {
  // Create mock Electron app
  createMockElectronApp() {
    return {
      on: jest.fn(),
      quit: jest.fn(),
      isReady: jest.fn().mockReturnValue(true),
      getVersion: jest.fn().mockReturnValue('1.0.0'),
      getName: jest.fn().mockReturnValue('FreeBusy Desktop'),
      getPath: jest.fn().mockReturnValue('/mock/path'),
      whenReady: jest.fn().mockResolvedValue()
    };
  },

  // Create mock BrowserWindow
  createMockBrowserWindow() {
    return {
      loadFile: jest.fn(),
      loadURL: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      close: jest.fn(),
      destroy: jest.fn(),
      isDestroyed: jest.fn().mockReturnValue(false),
      webContents: {
        send: jest.fn(),
        on: jest.fn(),
        executeJavaScript: jest.fn()
      },
      on: jest.fn(),
      once: jest.fn(),
      removeAllListeners: jest.fn()
    };
  },

  // Create mock Google Calendar API
  createMockGoogleAPI() {
    return {
      getFreeBusy: jest.fn(),
      getCalendarList: jest.fn(),
      getUserInfo: jest.fn(),
      setCredentials: jest.fn(),
      testConnection: jest.fn()
    };
  },

  // Create mock TokenManager
  createMockTokenManager() {
    return {
      storeTokens: jest.fn(),
      getTokens: jest.fn(),
      refreshTokens: jest.fn(),
      clearTokens: jest.fn(),
      isTokenValid: jest.fn(),
      getExpiryTime: jest.fn()
    };
  },

  // Delay utility for testing
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Generate test dates
  generateTestDates(startDate, count, includeWeekends = false) {
    const dates = [];
    const current = new Date(startDate);
    
    while (dates.length < count) {
      if (includeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  },

  // Format date for testing
  formatDateForTest(date) {
    return date.toISOString().split('T')[0];
  },

  // Create expected clipboard content
  createExpectedClipboard(availability, settings) {
    // Implementation would generate expected clipboard format
    // based on availability data and user settings
    return 'Mock clipboard content';
  }
};

module.exports.testHelpers = testHelpers;