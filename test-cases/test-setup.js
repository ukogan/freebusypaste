// Global test setup for Jest unit tests

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
  
  toBeValidTimeSlot(received) {
    const timeRegex = /^\d{1,2}:\d{2}\s?(AM|PM)$/;
    const pass = typeof received === 'string' && timeRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid time slot`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid time slot format`,
        pass: false,
      };
    }
  },
  
  toHaveValidAvailabilityStructure(received) {
    const hasRequiredFields = received && 
      typeof received === 'object' &&
      'generationId' in received &&
      'timestamp' in received &&
      'availability' in received;
      
    const pass = hasRequiredFields;
    if (pass) {
      return {
        message: () => `expected object not to have valid availability structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected object to have valid availability structure (generationId, timestamp, availability)`,
        pass: false,
      };
    }
  }
});

// Global test environment setup
beforeEach(() => {
  // Reset console to catch console.log calls in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console
  console.log.mockRestore && console.log.mockRestore();
  console.error.mockRestore && console.error.mockRestore();
  console.warn.mockRestore && console.warn.mockRestore();
});

// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.DEMO_MODE = 'true';

// Global test utilities
global.testUtils = {
  // Create mock date that doesn't change during tests
  createMockDate: (dateString = '2025-08-27T10:00:00Z') => {
    const mockDate = new Date(dateString);
    const originalDate = Date;
    global.Date = jest.fn(() => mockDate);
    global.Date.now = jest.fn(() => mockDate.getTime());
    global.Date.parse = originalDate.parse;
    global.Date.UTC = originalDate.UTC;
    return mockDate;
  },
  
  // Restore original Date
  restoreDate: () => {
    global.Date = Date;
  },
  
  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create mock availability data
  createMockAvailability: () => ({
    generationId: 'test-123',
    timestamp: '2025-08-27T10:00:00Z',
    dateRange: {
      start: '2025-08-27',
      end: '2025-08-29'
    },
    businessHours: {
      start: '9:00 AM',
      end: '5:00 PM'
    },
    meetingDurationMinutes: 30,
    availability: [
      {
        date: '2025-08-27',
        timeSlots: [
          { time: '9:00 AM', available: true },
          { time: '9:30 AM', available: false },
          { time: '10:00 AM', available: true }
        ]
      }
    ]
  })
};

// Suppress specific warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    (args[0].includes('Warning:') || args[0].includes('React'))
  ) {
    return;
  }
  originalConsoleError(...args);
};