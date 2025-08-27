// Simple working availability test
const AvailabilityGenerator = require('../../main/calendar/availability-generator');

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(() => ({
      freebusy: {
        query: jest.fn()
      }
    }))
  }
}));

describe('Simple Availability Tests', () => {
  let availabilityGenerator;
  let mockAuthManager;

  beforeEach(() => {
    mockAuthManager = {
      getAuthenticatedClient: jest.fn().mockResolvedValue({
        credentials: { access_token: 'test-token' }
      })
    };
    
    availabilityGenerator = new AvailabilityGenerator(mockAuthManager);
  });

  test('SIMPLE-AVAIL-001: Should create availability generator instance', () => {
    expect(availabilityGenerator).toBeDefined();
    expect(availabilityGenerator.authManager).toBe(mockAuthManager);
  });

  test('SIMPLE-AVAIL-002: Should format time correctly', () => {
    expect(availabilityGenerator.formatTime(9)).toBe('09:00');
    expect(availabilityGenerator.formatTime(13)).toBe('13:00');
    expect(availabilityGenerator.formatTime(0)).toBe('00:00');
    expect(availabilityGenerator.formatTime(12)).toBe('12:00');
  });

  test('SIMPLE-AVAIL-003: Should generate unique IDs', () => {
    const id1 = availabilityGenerator.generateId();
    const id2 = availabilityGenerator.generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(5);
  });

  test('SIMPLE-AVAIL-004: Should calculate date ranges', () => {
    const dateRange = availabilityGenerator.calculateDateRange(3, { saturday: false, sunday: false });
    
    expect(dateRange.start).toBeInstanceOf(Date);
    expect(dateRange.end).toBeInstanceOf(Date);
    expect(dateRange.end.getTime()).toBeGreaterThan(dateRange.start.getTime());
  });

  test('SIMPLE-AVAIL-005: Should handle authentication errors', async () => {
    mockAuthManager.getAuthenticatedClient.mockRejectedValue(new Error('Not authenticated'));

    await expect(
      availabilityGenerator.generate({ businessHoursStart: 9, businessHoursEnd: 17 })
    ).rejects.toThrow('Not authenticated');
  });
});