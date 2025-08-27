# FreeBusy Desktop - Comprehensive Test Plan

## Overview

This comprehensive test plan covers all aspects of the FreeBusy Desktop application across its 4-phase development approach. Test cases are structured to support both automated testing (Playwright/Jest) and manual testing scenarios.

## Test Environment Requirements

### macOS Testing Environment
- **Operating System**: macOS 10.15+ (Catalina and later)
- **Node.js**: Version 18.x LTS
- **Electron**: Version 27.x
- **Browser Support**: Chrome, Firefox, Safari for OAuth flows
- **System Requirements**: Keychain access, notification permissions, menu bar access

### Test Data Requirements
- Valid Google Calendar account with test events
- Secondary Google account for multi-account testing
- Test Zoom/meeting links
- Various calendar scenarios (busy/free periods, all-day events, recurring events)

---

# Phase 1: Core Desktop Application (MVP) Test Cases

## 1. Google Calendar OAuth Authentication

### 1.1 First-Time Authentication Flow (Critical Path)
**Test Case ID**: AUTH-001  
**Priority**: P0 (Critical)  
**Type**: Automated + Manual  

**Preconditions**:
- Fresh application installation
- User has Google Calendar account
- Internet connection available

**Test Steps**:
1. Launch FreeBusy Desktop for the first time
2. Click "Connect Google Calendar" in onboarding
3. Verify browser opens with Google OAuth consent screen
4. Grant calendar read-only permissions
5. Verify successful redirect back to application
6. Confirm tokens stored in macOS Keychain

**Expected Results**:
- OAuth flow completes within 30 seconds
- User sees "Connected Successfully" confirmation
- Application advances to next onboarding step
- Tokens securely stored in Keychain (verify with Keychain Access app)
- No sensitive data in application files or logs

**Automated Test Implementation**:
```javascript
// tests/e2e/authentication.test.js
describe('OAuth Authentication', () => {
  test('should complete first-time Google Calendar authentication', async () => {
    const { electronApp, page } = await launchApp();
    
    // Navigate to auth step
    await page.click('button:has-text("Get Started")');
    await page.click('button:has-text("Connect Google Calendar")');
    
    // Handle OAuth popup
    const [popup] = await Promise.all([
      electronApp.waitForEvent('window'),
      page.click('button:has-text("Connect Google Calendar")')
    ]);
    
    // Mock successful OAuth response
    await mockGoogleOAuthSuccess(popup);
    
    // Verify success state
    await expect(page.locator('text=Connected Successfully')).toBeVisible();
    await expect(page.locator('[data-testid="auth-status"]')).toContainText('Connected');
  });
});
```

### 1.2 Authentication Error Scenarios
**Test Case ID**: AUTH-002  
**Priority**: P1 (High)  
**Type**: Automated

**Scenarios to Test**:
- User denies OAuth permissions
- Network timeout during OAuth
- Invalid OAuth response
- Browser fails to open

**Test Steps**:
1. Initiate OAuth flow
2. Simulate error condition
3. Verify error handling and recovery options

**Expected Results**:
- Clear error messages displayed
- Retry options provided
- No application crash
- User can attempt re-authentication

### 1.3 Token Refresh and Expiry
**Test Case ID**: AUTH-003  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Mock expired OAuth tokens
2. Attempt availability generation
3. Verify automatic token refresh
4. Test silent re-authentication

**Expected Results**:
- Tokens refresh automatically when possible
- User prompted for re-auth when necessary
- No interruption to user workflow when tokens valid

## 2. One-Click Availability Generation

### 2.1 Basic Availability Generation (Critical Path)
**Test Case ID**: AVAIL-001  
**Priority**: P0 (Critical)  
**Type**: Automated + Manual

**Preconditions**:
- User authenticated with Google Calendar
- Calendar contains test data (mix of busy/free slots)
- Business hours configured (9 AM - 6 PM)

**Test Steps**:
1. Click "Generate Availability" button
2. Verify loading state appears
3. Wait for generation completion
4. Verify availability table displays
5. Check clipboard contains availability data

**Expected Results**:
- Generation completes within 5 seconds
- Availability table shows correct busy/free slots
- Data automatically copied to clipboard
- Success message displayed
- Button returns to ready state

**Automated Test Implementation**:
```javascript
// tests/e2e/availability-generation.test.js
describe('Availability Generation', () => {
  test('should generate availability within 5 seconds', async () => {
    const { page } = await launchAuthenticatedApp();
    
    // Mock calendar API response
    await mockCalendarAPI([
      { start: '2025-08-27T10:00:00Z', end: '2025-08-27T11:00:00Z' }, // busy
      { start: '2025-08-27T14:00:00Z', end: '2025-08-27T15:00:00Z' }  // busy
    ]);
    
    const startTime = Date.now();
    
    // Click generate button
    await page.click('[data-testid="generate-button"]');
    
    // Verify loading state
    await expect(page.locator('text=Checking calendar...')).toBeVisible();
    
    // Wait for completion
    await page.waitForSelector('[data-testid="availability-table"]');
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
    
    // Verify results
    const table = await page.locator('[data-testid="availability-table"]');
    await expect(table).toBeVisible();
    
    // Check clipboard
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Available Times');
  });
});
```

### 2.2 Calendar Data Edge Cases
**Test Case ID**: AVAIL-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Scenarios**:
- Empty calendar (no events)
- Fully booked calendar (no availability)
- All-day events
- Recurring events
- Events outside business hours
- Multiple calendars

**Test Steps** (for each scenario):
1. Configure test calendar data
2. Generate availability
3. Verify correct interpretation of events

**Expected Results**:
- All-day events block entire day
- Recurring events handled correctly
- Outside-hours events ignored
- Multiple calendar conflicts merged

### 2.3 Business Hours Configuration Impact
**Test Case ID**: AVAIL-003  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Set business hours to 10 AM - 4 PM
2. Create calendar events at 9 AM and 5 PM
3. Generate availability
4. Verify only 10 AM - 4 PM slots shown

**Expected Results**:
- Availability respects configured business hours
- Events outside hours don't affect availability
- Time slots align with business hours

## 3. Automatic Clipboard Integration

### 3.1 Clipboard Copy Functionality
**Test Case ID**: CLIP-001  
**Priority**: P0 (Critical)  
**Type**: Automated

**Test Steps**:
1. Generate availability successfully
2. Verify data copied to clipboard immediately
3. Check clipboard format and content
4. Test paste operation in external application

**Expected Results**:
- Clipboard updated within 1 second of generation
- Format suitable for email pasting
- Professional appearance
- Includes all availability slots and booking information

### 3.2 Clipboard Format Validation
**Test Case ID**: CLIP-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Generate availability for different scenarios
2. Check clipboard content format
3. Verify professional presentation

**Expected Format**:
```
Available Times - August 27-29, 2025

Wed 8/27    Thu 8/28    Fri 8/29
9:00 AM     [BOOK]      [BOOK]      [BOOK]
9:30 AM     [BOOK]      —           [BOOK]
10:00 AM    —           [BOOK]      [BOOK]

Meeting: Meeting with Uri
Zoom: https://rzero.zoom.us/j/5152335657
Contact: ukogan@rzero.com
```

## 4. Basic Settings Configuration

### 4.1 Settings Panel Access and Navigation
**Test Case ID**: SET-001  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Click settings button (⚙️) in main window
2. Verify settings modal opens
3. Navigate between all 4 tabs (Account, Personal, Schedule, Advanced)
4. Verify all form fields accessible
5. Close settings panel

**Expected Results**:
- Settings panel opens smoothly with modal overlay
- All tabs accessible and functional
- Form fields properly labeled and validated
- Panel closes without saving if canceled

### 4.2 Personal Information Configuration
**Test Case ID**: SET-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Open settings → Personal tab
2. Update email, meeting title, Zoom link
3. Verify real-time preview updates
4. Save settings
5. Generate availability to confirm changes applied

**Expected Results**:
- Form validation prevents invalid inputs
- Preview updates immediately as user types
- Settings persist between application sessions
- Changes reflected in generated availability

### 4.3 Schedule Configuration
**Test Case ID**: SET-003  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Open settings → Schedule tab
2. Modify business hours (start/end times)
3. Change meeting duration (15/30/45/60 minutes)
4. Adjust date range (3/5/7/14 days)
5. Toggle weekend availability
6. Save and test availability generation

**Expected Results**:
- Business hours validation (start < end)
- Duration affects slot granularity
- Date range changes availability window
- Weekend settings add/remove Saturday/Sunday

## 5. macOS Menu Bar Integration

### 5.1 System Tray Setup and Display
**Test Case ID**: TRAY-001  
**Priority**: P0 (Critical)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Launch FreeBusy Desktop
2. Verify menu bar icon appears
3. Minimize main window
4. Verify application remains in menu bar
5. Check icon states (default, generating, success, error)

**Expected Results**:
- Menu bar icon visible and properly positioned
- Icon changes state during operations
- Application accessible from menu bar when main window closed
- Icon remains visible across macOS updates and reboots

### 5.2 System Tray Context Menu
**Test Case ID**: TRAY-002  
**Priority**: P1 (High)  
**Type**: Manual + Automated

**Test Steps**:
1. Right-click menu bar icon
2. Verify context menu appears with all options:
   - ⚡ Quick Generate
   - 📋 Copy Last Result
   - 🏠 Show App
   - ⚙️ Settings
   - ❌ Quit FreeBusy
3. Test each menu option

**Expected Results**:
- Context menu appears within 200ms
- All menu items functional
- Visual indicators for disabled items
- Proper keyboard navigation support

### 5.3 Quick Generate from Menu Bar
**Test Case ID**: TRAY-003  
**Priority**: P0 (Critical)  
**Type**: Manual + Automated

**Test Steps**:
1. Right-click menu bar icon
2. Click "Quick Generate"
3. Verify background processing (no window opening)
4. Check for completion notification
5. Verify clipboard contains availability

**Expected Results**:
- Generation occurs in background
- Desktop notification shows completion
- Menu bar icon shows status (pulsing during generation)
- Total time from click to clipboard ≤ 8 seconds
- User can immediately paste result

---

# Phase 2: Booking Links & Enhanced Experience Test Cases

## 6. Professional Booking Links

### 6.1 Booking Link Generation
**Test Case ID**: BOOK-001  
**Priority**: P0 (Critical)  
**Type**: Automated

**Test Steps**:
1. Generate availability successfully
2. Verify booking links appear for available slots
3. Click booking link
4. Verify calendar invitation process
5. Test link format and accessibility

**Expected Results**:
- Each available slot has functional booking link
- Links follow professional format
- Calendar invitation created with correct details
- Links work across different browsers/devices

### 6.2 Booking Link Content Validation
**Test Case ID**: BOOK-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Configure meeting details in settings
2. Generate availability with booking links
3. Verify link contains:
   - Meeting title
   - Zoom/meeting link
   - Duration
   - Attendee email
   - Time zone information

**Expected Results**:
- All meeting details included in booking process
- Time zones handled correctly for recipient
- Professional presentation throughout booking flow

## 7. Onboarding Wizard

### 7.1 Complete Onboarding Flow
**Test Case ID**: ONBOARD-001  
**Priority**: P0 (Critical)  
**Type**: Automated + Manual

**Test Steps**:
1. Launch application for first time
2. Complete 4-step onboarding:
   - Step 1: Welcome screen
   - Step 2: Google Calendar authentication
   - Step 3: Personal configuration
   - Step 4: Completion confirmation
3. Verify smooth transitions between steps
4. Test back/forward navigation

**Expected Results**:
- Each step completes within expected time
- Progress indicator updates correctly
- User can navigate forward/backward
- Skip options work where provided
- Setup completion rate >90% target

### 7.2 Onboarding Error Recovery
**Test Case ID**: ONBOARD-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Simulate errors at each onboarding step:
   - Network failure during authentication
   - Invalid form inputs
   - Permission denied
2. Verify recovery mechanisms
3. Test retry functionality

**Expected Results**:
- Clear error messages with recovery guidance
- User can retry failed operations
- Onboarding can be resumed after errors
- No data loss during error recovery

## 8. Global Keyboard Shortcuts

### 8.1 Keyboard Shortcut Registration
**Test Case ID**: SHORTCUT-001  
**Priority**: P1 (High)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Launch FreeBusy Desktop
2. Verify global shortcut (Cmd+Shift+G) registered
3. Test shortcut from various applications
4. Verify no conflicts with system shortcuts

**Expected Results**:
- Shortcut works from any application
- No interference with macOS system shortcuts
- Preference pane allows customization
- Shortcut disabled when application not running

### 8.2 Shortcut Functionality
**Test Case ID**: SHORTCUT-002  
**Priority**: P1 (High)  
**Type**: Manual + Automated

**Test Steps**:
1. Press Cmd+Shift+G from any application
2. Verify availability generation starts
3. Check for completion notification
4. Verify clipboard updated

**Expected Results**:
- Generation triggered without opening main window
- Background processing completes normally
- Desktop notification confirms success
- Result immediately available for pasting

## 9. Desktop Notifications

### 9.1 Notification Display and Content
**Test Case ID**: NOTIF-001  
**Priority**: P1 (High)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Enable notifications in macOS System Preferences
2. Generate availability via various methods
3. Verify notifications appear for:
   - Generation completion
   - Generation errors
   - Authentication issues
4. Test notification actions (if any)

**Expected Results**:
- Notifications appear within 1 second of event
- Content includes relevant information
- Notifications follow macOS guidelines
- User can disable in application settings

### 9.2 Notification Permissions
**Test Case ID**: NOTIF-002  
**Priority**: P2 (Medium)  
**Type**: Manual

**Test Steps**:
1. Fresh application installation
2. First availability generation
3. Verify permission request for notifications
4. Test behavior when permissions denied
5. Test re-enabling permissions

**Expected Results**:
- Permission requested on first notification attempt
- Graceful degradation when permissions denied
- User can re-enable in System Preferences
- Application detects permission changes

## 10. Enhanced Error Handling

### 10.1 Network Error Recovery
**Test Case ID**: ERROR-001  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Disconnect internet connection
2. Attempt availability generation
3. Verify error handling and user feedback
4. Reconnect internet
5. Test automatic retry functionality

**Expected Results**:
- Clear "No internet connection" message
- Cached data shown if available
- Automatic retry when connection restored
- No application crash or freezing

### 10.2 API Error Scenarios
**Test Case ID**: ERROR-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Mock various Google API errors:
   - Rate limiting (429)
   - Authentication expired (401)
   - Insufficient permissions (403)
   - Service unavailable (503)
2. Verify appropriate error handling
3. Test recovery mechanisms

**Expected Results**:
- Specific error messages for each scenario
- Retry mechanisms with exponential backoff
- User guidance for resolution steps
- Graceful degradation where possible

---

# Phase 3: Advanced Scheduling Features Test Cases

## 11. Extended Scheduling Options

### 11.1 Weekend Availability Configuration
**Test Case ID**: WEEKEND-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Enable weekend availability in settings
2. Configure Saturday/Sunday business hours
3. Generate availability spanning weekends
4. Verify weekend slots included correctly

**Expected Results**:
- Saturday/Sunday options in settings work correctly
- Weekend business hours configurable independently
- Generated availability includes weekend slots
- Professional presentation maintained

### 11.2 Custom Date Range Selection
**Test Case ID**: RANGE-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Test various date range options:
   - 3, 5, 7, 14 days
   - Custom date picker
   - Specific start/end dates
2. Verify calendar queries match selected range
3. Check availability table formatting

**Expected Results**:
- All date range options function correctly
- Calendar API queries optimized for range
- Table layout adjusts for different ranges
- Performance maintained for longer ranges

## 12. Multiple Export Formats

### 12.1 Export Format Options
**Test Case ID**: EXPORT-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Generate availability successfully
2. Test export to different formats:
   - Markdown (.md)
   - HTML (.html)
   - CSV (.csv)
   - Plain text (.txt)
3. Verify file content and formatting

**Expected Results**:
- All export formats available in UI
- Files generated correctly
- Professional formatting maintained
- Files compatible with target applications

### 12.2 Export File Naming and Location
**Test Case ID**: EXPORT-002  
**Priority**: P2 (Medium)  
**Type**: Manual

**Test Steps**:
1. Export availability to file
2. Verify default filename format
3. Test custom filename specification
4. Check default save location

**Expected Results**:
- Filename includes date range and timestamp
- User can specify custom filename
- Files saved to appropriate default location
- File picker allows custom location selection

## 13. Offline Mode and Caching

### 13.1 Offline Functionality
**Test Case ID**: OFFLINE-001  
**Priority**: P1 (High)  
**Type**: Manual + Automated

**Test Steps**:
1. Generate availability while online
2. Disconnect internet connection
3. Attempt to generate availability
4. Verify cached data presentation
5. Reconnect and verify sync

**Expected Results**:
- Last generated availability available offline
- Clear indication of cached data age
- Limited functionality message displayed
- Automatic refresh when online resumed

### 13.2 Cache Management
**Test Case ID**: CACHE-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Generate availability multiple times
2. Verify cache size limits (100 entries max)
3. Test cache expiration (1 hour default)
4. Test cache cleanup on startup

**Expected Results**:
- Cache size remains within limits
- Expired entries automatically removed
- Startup time not affected by large cache
- Cache can be manually cleared

## 14. Advanced Customization

### 14.1 Availability Table Customization
**Test Case ID**: CUSTOM-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Access advanced customization settings
2. Test table format options:
   - Column layout (time vs date)
   - Visual styling options
   - Information included/excluded
3. Verify changes reflected in output

**Expected Results**:
- Multiple layout options available
- Changes preview in real-time
- Custom formats persist between sessions
- Professional appearance maintained

### 14.2 Meeting Duration Flexibility
**Test Case ID**: DURATION-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Test various meeting durations:
   - 15, 30, 45, 60 minutes
   - Custom duration input
2. Verify slot calculation accuracy
3. Check availability table spacing

**Expected Results**:
- All standard durations supported
- Custom duration option functional
- Slot boundaries calculated correctly
- No overlapping availability slots

---

# Phase 4: Multi-Account Features Test Cases

## 15. Multi-Account Support

### 15.1 Multiple Google Account Authentication
**Test Case ID**: MULTI-001  
**Priority**: P2 (Medium)  
**Type**: Manual + Automated

**Test Steps**:
1. Authenticate with primary Google account
2. Add secondary Google account
3. Switch between accounts
4. Generate availability for each account
5. Verify data isolation

**Expected Results**:
- Multiple accounts can be authenticated
- Account switching works smoothly
- Each account's data kept separate
- No cross-account data leakage

### 15.2 Account Management Interface
**Test Case ID**: MULTI-002  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Access account management settings
2. View list of authenticated accounts
3. Test account actions:
   - Switch active account
   - Remove account
   - Rename account display name
4. Verify UI updates correctly

**Expected Results**:
- All authenticated accounts listed clearly
- Active account prominently indicated
- Account management actions work correctly
- Settings update reflect account changes

## 16. Calendar Filtering and Selection

### 16.1 Calendar Discovery and Listing
**Test Case ID**: FILTER-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Authenticate with account having multiple calendars
2. Access calendar selection interface
3. Verify all available calendars listed
4. Test calendar information display

**Expected Results**:
- All accessible calendars discovered
- Calendar names and colors shown
- Calendar types identified (primary, shared, etc.)
- Selection interface intuitive

### 16.2 Calendar Filtering Functionality
**Test Case ID**: FILTER-002  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Select/deselect various calendars
2. Generate availability with filtered calendars
3. Verify only selected calendars affect availability
4. Test filter persistence across sessions

**Expected Results**:
- Calendar selection affects availability calculation
- Deselected calendars ignored completely
- Filter settings saved and restored
- Clear indication of active filters

## 17. Scheduling Templates

### 17.1 Template Creation and Management
**Test Case ID**: TEMPLATE-001  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Create scheduling template with:
   - Specific business hours
   - Meeting duration
   - Date range
   - Calendar selection
2. Save template with descriptive name
3. Apply template to availability generation
4. Test template modification and deletion

**Expected Results**:
- Templates save all configuration options
- Template application updates all settings
- Templates can be renamed and deleted
- Template list shows relevant information

### 17.2 Pre-defined Template Options
**Test Case ID**: TEMPLATE-002  
**Priority**: P2 (Medium)  
**Type**: Automated

**Test Steps**:
1. Verify built-in templates:
   - "Quick Meeting" (30 min, 3 days)
   - "Detailed Planning" (60 min, 7 days)
   - "Emergency Slot" (15 min, 1 day)
2. Test template application
3. Verify template customization options

**Expected Results**:
- Built-in templates provide good defaults
- Templates can be customized after selection
- Custom templates can be based on built-ins
- Template system enhances workflow efficiency

## 18. Usage Analytics Dashboard

### 18.1 Local Analytics Collection
**Test Case ID**: ANALYTICS-001  
**Priority**: P3 (Low)  
**Type**: Automated

**Test Steps**:
1. Use application normally for period of time
2. Access analytics dashboard
3. Verify metrics collected:
   - Generation frequency
   - Most used settings
   - Peak usage times
   - Error rates
4. Verify privacy compliance (local only)

**Expected Results**:
- Analytics data collected locally only
- No data transmitted to external services
- Meaningful insights provided
- Data can be exported or cleared

### 18.2 Analytics Visualization
**Test Case ID**: ANALYTICS-002  
**Priority**: P3 (Low)  
**Type**: Manual

**Test Steps**:
1. Access analytics dashboard
2. Review various visualizations:
   - Usage over time
   - Feature adoption rates
   - Error frequency charts
3. Test time range filters
4. Verify export functionality

**Expected Results**:
- Charts and graphs clearly presented
- Data filtering options functional
- Export to common formats available
- Insights actionable for user workflow optimization

---

# Integration and System Test Cases

## 19. macOS System Integration

### 19.1 Keychain Integration
**Test Case ID**: SYS-001  
**Priority**: P0 (Critical)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Authenticate with Google Calendar
2. Open macOS Keychain Access
3. Locate FreeBusy entries
4. Verify token encryption and storage
5. Test token retrieval after app restart

**Expected Results**:
- Tokens stored in macOS Keychain
- Entries properly encrypted
- Application can retrieve tokens after restart
- No tokens stored in application files

### 19.2 Notification Center Integration
**Test Case ID**: SYS-002  
**Priority**: P1 (High)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Ensure notifications enabled in System Preferences
2. Generate availability to trigger notification
3. Verify notification appears in Notification Center
4. Test notification history and clearing

**Expected Results**:
- Notifications appear in Notification Center
- Proper app icon and branding displayed
- Notifications can be cleared individually
- History maintained according to system settings

### 19.3 Login Items Integration
**Test Case ID**: SYS-003  
**Priority**: P2 (Medium)  
**Type**: Manual (macOS-specific)

**Test Steps**:
1. Enable "Start with system" in settings
2. Restart macOS
3. Verify FreeBusy launches automatically
4. Check launch time and resource usage
5. Test disable functionality

**Expected Results**:
- Application launches on system startup
- Startup time ≤3 seconds target
- Memory usage ≤150MB target
- Option can be disabled in settings

## 20. Performance and Resource Usage

### 20.1 Memory Usage Monitoring
**Test Case ID**: PERF-001  
**Priority**: P1 (High)  
**Type**: Automated + Manual

**Test Steps**:
1. Launch application and monitor baseline memory
2. Perform typical operations:
   - Authentication
   - Availability generation
   - Settings changes
   - Cache operations
3. Monitor memory usage over extended period
4. Test memory cleanup after operations

**Expected Results**:
- Baseline memory usage ≤150MB
- No memory leaks during normal operations
- Memory usage stable over extended use
- Resource cleanup after operations complete

### 20.2 Application Startup Performance
**Test Case ID**: PERF-002  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Measure cold startup time (fresh launch)
2. Measure warm startup time (recent launch)
3. Test startup with various system loads
4. Verify functionality available quickly

**Expected Results**:
- Cold startup ≤3 seconds
- Warm startup ≤1 second  
- Core functionality available immediately
- Background tasks don't block UI

### 20.3 API Response Time Optimization
**Test Case ID**: PERF-003  
**Priority**: P1 (High)  
**Type**: Automated

**Test Steps**:
1. Monitor Google Calendar API response times
2. Test with various calendar sizes:
   - Light usage (few events)
   - Heavy usage (many events)
   - Multiple calendars
3. Verify caching effectiveness
4. Test rate limiting handling

**Expected Results**:
- Availability generation ≤5 seconds
- Caching reduces subsequent query times
- Rate limiting handled gracefully
- Performance degrades gracefully with scale

## 21. Security and Privacy

### 21.1 Token Security Validation
**Test Case ID**: SEC-001  
**Priority**: P0 (Critical)  
**Type**: Manual + Automated

**Test Steps**:
1. Authenticate and verify token storage
2. Search application files for token data
3. Check network traffic for token exposure
4. Test token cleanup on logout/uninstall
5. Verify token rotation handling

**Expected Results**:
- No tokens in application files or logs
- Tokens only transmitted over HTTPS
- Tokens properly cleared on logout
- Token rotation handled automatically
- Minimal token scope (read-only calendar)

### 21.2 Data Privacy Compliance
**Test Case ID**: SEC-002  
**Priority**: P0 (Critical)  
**Type**: Manual + Automated

**Test Steps**:
1. Monitor all network traffic during operation
2. Verify no data sent to non-Google services
3. Check local data storage contents
4. Test data export/deletion capabilities
5. Verify privacy policy accuracy

**Expected Results**:
- No data transmitted except to Google APIs
- Local storage contains only necessary data
- User can export all personal data
- User can delete all stored data
- Privacy policy accurately reflects practices

## 22. Cross-Browser OAuth Testing

### 22.1 OAuth Browser Compatibility
**Test Case ID**: BROWSER-001  
**Priority**: P1 (High)  
**Type**: Manual

**Test Steps**:
1. Test OAuth flow with different default browsers:
   - Safari (default macOS)
   - Chrome
   - Firefox
   - Edge
2. Verify successful authentication in each
3. Test error scenarios per browser

**Expected Results**:
- OAuth completes successfully in all browsers
- Consistent user experience across browsers
- Error handling works in all browsers
- Fallback options available if browser fails

### 22.2 Browser Security Settings Impact
**Test Case ID**: BROWSER-002  
**Priority**: P2 (Medium)  
**Type**: Manual

**Test Steps**:
1. Test with various browser security settings:
   - Ad blockers enabled
   - Third-party cookies blocked
   - JavaScript disabled
   - Pop-up blockers active
2. Verify OAuth completion or clear error messages

**Expected Results**:
- OAuth works with common security settings
- Clear error messages when settings interfere
- Guidance provided for resolving issues
- Fallback authentication methods available

---

# Manual Testing Scenarios

## 23. User Experience Testing

### 23.1 First-Time User Journey
**Test Case ID**: UX-001  
**Priority**: P0 (Critical)  
**Type**: Manual

**Scenario**: New user discovers and adopts FreeBusy Desktop

**Test Steps**:
1. Install application fresh
2. Complete entire onboarding process naturally
3. Configure personal settings
4. Generate first availability
5. Use result in actual email/scheduling scenario
6. Explore additional features organically

**Success Criteria**:
- User completes setup within 60 seconds
- User understands core value proposition
- User successfully shares availability externally
- User discovers menu bar functionality
- User expresses confidence in security/privacy

### 23.2 Power User Efficiency Testing
**Test Case ID**: UX-002  
**Priority**: P1 (High)  
**Type**: Manual

**Scenario**: Daily power user workflow optimization

**Test Steps**:
1. Simulate daily scheduling workflow
2. Test various entry points (menu bar, shortcut, main app)
3. Measure time from need to clipboard
4. Test interruption and recovery scenarios
5. Evaluate keyboard-only navigation

**Success Criteria**:
- Menu bar workflow ≤8 seconds total
- Keyboard shortcut workflow ≤5 seconds
- User can work without opening main window
- Interruptions don't affect workflow
- Power features discoverable

### 23.3 Error Recovery User Experience
**Test Case ID**: UX-003  
**Priority**: P1 (High)  
**Type**: Manual

**Scenario**: User encounters and recovers from various errors

**Test Steps**:
1. Simulate network disconnection during use
2. Test authentication expiry scenario
3. Experience rate limiting from Google
4. Encounter calendar permission changes
5. Recover from application crash

**Success Criteria**:
- Error messages clear and actionable
- Recovery steps obvious and simple
- User maintains confidence in application
- No data loss during error scenarios
- Help resources easily accessible

## 24. Accessibility Testing

### 24.1 Screen Reader Compatibility
**Test Case ID**: ACCESS-001  
**Priority**: P2 (Medium)  
**Type**: Manual

**Test Steps**:
1. Enable macOS VoiceOver
2. Navigate entire application with screen reader
3. Test all major workflows
4. Verify proper ARIA labels and roles
5. Test keyboard navigation completeness

**Expected Results**:
- All UI elements properly announced
- Navigation logical and complete
- Forms accessible and properly labeled
- Status updates communicated to screen reader
- Keyboard alternatives for all mouse actions

### 24.2 High Contrast and Visual Accessibility
**Test Case ID**: ACCESS-002  
**Priority**: P2 (Medium)  
**Type**: Manual

**Test Steps**:
1. Enable macOS high contrast mode
2. Test with various system appearance settings
3. Verify text readability at all sizes
4. Test color-dependent information
5. Verify focus indicators visible

**Expected Results**:
- High contrast mode fully supported
- Text remains readable in all modes
- Information conveyed beyond color alone
- Focus indicators clear and visible
- UI scales properly with system font size

---

# Automated Test Implementation Guidelines

## Test Infrastructure Setup

### Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  use: {
    browserName: 'chromium',
    headless: false, // For OAuth testing
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'electron',
      testMatch: /.*\.electron\.test\.js/,
      use: {
        // Electron-specific configuration
      }
    }
  ]
};
```

### Jest Configuration for Unit Tests
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Mock Services Setup
```javascript
// tests/mocks/google-calendar.js
class MockGoogleCalendar {
  constructor() {
    this.events = [];
  }

  setMockEvents(events) {
    this.events = events;
  }

  async freebusy(params) {
    // Mock implementation
    return {
      calendars: {
        primary: {
          busy: this.events
        }
      }
    };
  }
}

module.exports = MockGoogleCalendar;
```

## Test Data Management

### Test Calendar Events
```javascript
// tests/fixtures/calendar-events.js
const TestEvents = {
  TYPICAL_BUSINESS_DAY: [
    {
      start: { dateTime: '2025-08-27T10:00:00-07:00' },
      end: { dateTime: '2025-08-27T11:00:00-07:00' }
    },
    {
      start: { dateTime: '2025-08-27T14:00:00-07:00' },
      end: { dateTime: '2025-08-27T15:30:00-07:00' }
    }
  ],
  
  FULLY_BOOKED_DAY: [
    {
      start: { dateTime: '2025-08-27T09:00:00-07:00' },
      end: { dateTime: '2025-08-27T18:00:00-07:00' }
    }
  ],
  
  EMPTY_CALENDAR: []
};

module.exports = TestEvents;
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: FreeBusy Desktop Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## Test Execution Strategy

### Test Phases
1. **Unit Tests**: Fast, isolated component testing
2. **Integration Tests**: API and system integration
3. **E2E Tests**: Complete user workflows
4. **Manual Tests**: macOS-specific and UX scenarios

### Test Priorities
- **P0 (Critical)**: Must pass before any release
- **P1 (High)**: Required for production readiness
- **P2 (Medium)**: Important for user experience
- **P3 (Low)**: Nice-to-have validations

### Success Criteria Summary

**Phase 1 (MVP) Success Metrics**:
- OAuth completion rate: >95%
- Availability generation time: <5 seconds
- Clipboard copy success: >99%
- System tray functionality: 100% operational
- Memory usage: <150MB

**Phase 2 (Enhanced UX) Success Metrics**:
- Onboarding completion: >90%
- Booking link generation: 100% functional
- Notification delivery: >95%
- Error recovery success: >85%
- Keyboard shortcut reliability: >99%

**Phase 3 (Advanced Features) Success Metrics**:
- Export format compatibility: 100%
- Offline mode functionality: Graceful degradation
- Custom scheduling accuracy: 100%
- Cache performance improvement: >50% faster repeat operations

**Phase 4 (Multi-Account) Success Metrics**:
- Multi-account switching: <2 seconds
- Calendar filtering accuracy: 100%
- Template system usability: >80% adoption
- Analytics privacy compliance: 100% local-only

This comprehensive test plan ensures FreeBusy Desktop meets all requirements across its development phases while maintaining high quality, security, and user experience standards.