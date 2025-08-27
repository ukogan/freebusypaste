// tests/unit/calendar/availability-generator.test.js
const AvailabilityGenerator = require('../../main/calendar/availability-generator');

// Mock dependencies
jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(() => ({
      freebusy: {
        query: jest.fn()
      }
    }))
  }
}));

describe('AvailabilityGenerator', () => {
  let availabilityGenerator;
  let mockAuthManager;
  let mockCalendar;
  
  const { google } = require('googleapis');

  const defaultOptions = {
    businessHoursStart: 9,
    businessHoursEnd: 17,
    meetingDurationMinutes: 30,
    dateRangeDays: 3,
    includeWeekends: { saturday: false, sunday: false },
    email: 'test@example.com',
    meetingTitle: 'Meeting',
    zoomLink: 'https://zoom.us/j/123456789'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCalendar = {
      freebusy: {
        query: jest.fn()
      }
    };
    
    google.calendar.mockReturnValue(mockCalendar);
    
    mockAuthManager = {
      getAuthenticatedClient: jest.fn().mockResolvedValue({
        credentials: { access_token: 'test-token' }
      })
    };
    
    availabilityGenerator = new AvailabilityGenerator(mockAuthManager);
  });

  describe('Date Range Calculation', () => {
    test('AVAIL-UNIT-001: Should calculate correct date range for 3 business days', () => {
      // Mock current date as Monday
      const mockMonday = new Date('2025-08-25T10:00:00Z');
      jest.spyOn(Date, 'now').mockReturnValue(mockMonday.getTime());
      jest.spyOn(global, 'Date').mockImplementation((...args) => {
        if (args.length === 0) {
          return new Date(mockMonday);
        }
        return new Date(...args);
      });
      
      const dateRange = availabilityGenerator.calculateDateRange(3, { saturday: false, sunday: false });
      
      expect(dateRange.start).toBeInstanceOf(Date);
      expect(dateRange.end).toBeInstanceOf(Date);
      
      // Should be at least 3 days apart
      const daysDiff = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(2); // 3 days = 2 full day intervals
      
      jest.restoreAllMocks();
    });

    test('AVAIL-UNIT-002: Should include weekends when specified', () => {
      const dateRange = availabilityGenerator.calculateDateRange(7, { saturday: true, sunday: true });
      
      const daysDiff = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(6); // 7 days = 6 full day intervals
    });
  });

  describe('Time Formatting', () => {
    test('AVAIL-UNIT-003: Should format hours correctly', () => {
      expect(availabilityGenerator.formatTime(9)).toBe('9:00 AM');
      expect(availabilityGenerator.formatTime(13)).toBe('1:00 PM');
      expect(availabilityGenerator.formatTime(0)).toBe('12:00 AM');
      expect(availabilityGenerator.formatTime(12)).toBe('12:00 PM');
    });
  });

  describe('Availability Generation', () => {
    test('AVAIL-UNIT-004: Should generate availability with no conflicts', async () => {
      // Setup mock for no busy times
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            primary: {
              busy: []
            }
          }
        }
      });

      const result = await availabilityGenerator.generate(defaultOptions);
      
      expect(result).toBeDefined();
      expect(result.generationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.availability).toBeDefined();
      expect(result.availability.length).toBeGreaterThan(0);
      
      // Should have available slots
      const hasAvailableSlots = result.availability.some(day => 
        day.timeSlots.some(slot => slot.available === true)
      );
      expect(hasAvailableSlots).toBe(true);
    });

    test('AVAIL-UNIT-005: Should handle busy periods correctly', async () => {
      // Setup mock with busy times
      const busyTimes = [
        {
          start: '2025-08-25T17:00:00Z', // 10:00 AM PDT
          end: '2025-08-25T18:00:00Z'    // 11:00 AM PDT
        }
      ];

      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            primary: {
              busy: busyTimes
            }
          }
        }
      });

      const result = await availabilityGenerator.generate(defaultOptions);
      
      expect(result).toBeDefined();
      expect(result.availability).toBeDefined();
      
      // Should have both busy and free slots
      const hasBusySlots = result.availability.some(day => 
        day.timeSlots.some(slot => slot.available === false)
      );
      const hasFreeSlots = result.availability.some(day => 
        day.timeSlots.some(slot => slot.available === true)
      );
      
      expect(hasBusySlots).toBe(true);
      expect(hasFreeSlots).toBe(true);
    });

    test('AVAIL-UNIT-006: Should handle Google Calendar API errors', async () => {
      mockCalendar.freebusy.query.mockRejectedValue(new Error('API Error'));

      await expect(availabilityGenerator.generate(defaultOptions))
        .rejects.toThrow('API Error');
    });

    test('AVAIL-UNIT-007: Should handle authentication errors', async () => {
      mockAuthManager.getAuthenticatedClient.mockRejectedValue(new Error('Not authenticated'));

      await expect(availabilityGenerator.generate(defaultOptions))
        .rejects.toThrow('Not authenticated');
    });
  });

  describe('ID Generation', () => {
    test('AVAIL-UNIT-008: Should generate unique IDs', () => {
      const id1 = availabilityGenerator.generateId();
      const id2 = availabilityGenerator.generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(5);
    });
  });

  describe('Busy Times Processing', () => {
    test('AVAIL-UNIT-009: Should correctly process Google Calendar busy times', async () => {
      const mockBusyData = {
        data: {
          calendars: {
            primary: {
              busy: [
                {
                  start: '2025-08-25T17:00:00Z',
                  end: '2025-08-25T18:00:00Z'
                }
              ]
            }
          }
        }
      };

      mockCalendar.freebusy.query.mockResolvedValue(mockBusyData);
      
      const dateRange = {
        start: new Date('2025-08-25T00:00:00Z'),
        end: new Date('2025-08-27T23:59:59Z')
      };
      
      const busyTimes = await availabilityGenerator.getBusyTimes(mockCalendar, dateRange, 'UTC');
      
      expect(busyTimes).toBeDefined();
      expect(Array.isArray(busyTimes)).toBe(true);
      expect(busyTimes.length).toBe(1);
      expect(busyTimes[0].start).toBe('2025-08-25T17:00:00Z');
    });

    test('AVAIL-UNIT-010: Should handle empty busy times', async () => {
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            primary: {
              busy: []
            }
          }
        }
      });
      
      const dateRange = {
        start: new Date('2025-08-25T00:00:00Z'),
        end: new Date('2025-08-27T23:59:59Z')
      };
      
      const busyTimes = await availabilityGenerator.getBusyTimes(mockCalendar, dateRange, 'UTC');
      
      expect(busyTimes).toBeDefined();
      expect(Array.isArray(busyTimes)).toBe(true);
      expect(busyTimes.length).toBe(0);
    });
  });

  describe('Settings Validation', () => {
    test('AVAIL-UNIT-011: Should use default settings when none provided', async () => {
      mockCalendar.freebusy.query.mockResolvedValue({
        data: { calendars: { primary: { busy: [] } } }
      });

      const result = await availabilityGenerator.generate();
      
      expect(result.businessHours.start).toBe('9:00 AM');
      expect(result.businessHours.end).toBe('5:00 PM');
      expect(result.meetingDurationMinutes).toBe(30);
    });

    test('AVAIL-UNIT-012: Should validate business hours', async () => {
      const invalidOptions = {
        ...defaultOptions,
        businessHoursStart: 18,
        businessHoursEnd: 9 // End before start
      };

      mockCalendar.freebusy.query.mockResolvedValue({
        data: { calendars: { primary: { busy: [] } } }
      });

      // Should handle invalid hours gracefully
      const result = await availabilityGenerator.generate(invalidOptions);
      expect(result).toBeDefined();
    });
  });
});