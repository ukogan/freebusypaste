# FreeBusy Desktop - Manual Test Scenarios

## Overview

These manual test scenarios cover macOS-specific functionality, user experience flows, and edge cases that require human judgment and cannot be easily automated. These tests should be performed on actual macOS hardware with real Google Calendar accounts.

---

## Test Environment Setup

### Required Test Environment
- **Hardware**: MacBook or iMac running macOS 10.15+ (Catalina or later)
- **Accounts**: 
  - Primary Google account with calendar access
  - Secondary Google account for multi-account testing
  - Test Google Workspace account (if available)
- **Calendar Data**: Test events scheduled across different time periods
- **Network Conditions**: Ability to simulate poor/intermittent connectivity
- **External Apps**: Email client, Slack, or other apps for paste testing

### Test Data Preparation
1. **Primary Calendar**: Schedule mix of busy periods and free time
2. **Multiple Calendar Test**: Create/access work and personal calendars
3. **Event Variations**: Include recurring events, all-day events, tentative events
4. **Time Zones**: Test with events in different time zones (if applicable)
5. **Large Calendar**: Access account with many events for performance testing

---

# Phase 1: Core Desktop Application Manual Tests

## MAC-001: macOS System Integration Tests

### MAC-001-1: Keychain Integration Verification
**Test Type**: Security Validation  
**Priority**: P0 (Critical)  
**Duration**: 10 minutes  

**Objective**: Verify OAuth tokens are securely stored in macOS Keychain and accessible only to FreeBusy.

**Test Steps**:
1. Complete Google Calendar authentication in FreeBusy
2. Verify authentication success and functionality
3. Open **Keychain Access** application (Applications > Utilities)
4. Search for "FreeBusy" or "freebusy-desktop" entries
5. Locate OAuth token entries
6. Right-click entry → "Get Info"
7. Verify access control settings
8. Quit FreeBusy completely
9. Relaunch FreeBusy
10. Verify automatic authentication without re-login

**Expected Results**:
- [ ] FreeBusy entries appear in Login keychain
- [ ] Entries are properly encrypted (not readable in plain text)
- [ ] Access control limited to FreeBusy application
- [ ] Application can retrieve tokens after restart
- [ ] No OAuth tokens found in application files or preferences

**Failure Scenarios to Note**:
- Tokens visible in plain text
- Tokens accessible by other applications
- Application fails to retrieve tokens after restart
- Tokens found in ~/Library/Preferences or app directory

### MAC-001-2: Menu Bar Integration Testing
**Test Type**: UI/System Integration  
**Priority**: P0 (Critical)  
**Duration**: 15 minutes  

**Objective**: Verify FreeBusy integrates properly with macOS menu bar and behaves correctly across system events.

**Test Steps**:
1. Launch FreeBusy Desktop
2. Verify menu bar icon appears in system tray
3. Test icon visibility with different menu bar configurations:
   - Light mode/Dark mode switching
   - Hide/show menu bar (System Preferences > Dock & Menu Bar)
   - Multiple monitors (if available)
4. Right-click menu bar icon
5. Verify context menu appears with all expected options
6. Test each menu option functionality
7. Close main window and verify app remains in menu bar
8. Test system events impact:
   - Put Mac to sleep and wake
   - Switch between spaces/desktops
   - Logout/login (if safe to test)

**Expected Results**:
- [ ] Menu bar icon appears and remains visible
- [ ] Icon adapts to light/dark mode automatically
- [ ] Right-click context menu appears quickly (<200ms)
- [ ] All menu options functional
- [ ] App persists in menu bar when main window closed
- [ ] Icon survives system sleep/wake cycles
- [ ] Proper positioning relative to other menu bar items

**Context Menu Items to Verify**:
- [ ] ⚡ Quick Generate
- [ ] 📋 Copy Last Result (if available)
- [ ] 🏠 Show App
- [ ] ⚙️ Settings
- [ ] ❌ Quit FreeBusy

### MAC-001-3: Notification Center Integration
**Test Type**: System Integration  
**Priority**: P1 (High)  
**Duration**: 10 minutes  

**Objective**: Verify FreeBusy notifications integrate properly with macOS Notification Center.

**Pre-setup**:
1. System Preferences > Notifications & Focus
2. Ensure FreeBusy notifications are allowed
3. Set notification style to "Alerts" for better testing

**Test Steps**:
1. Generate availability via menu bar "Quick Generate"
2. Verify desktop notification appears
3. Check notification content and formatting
4. Click notification (if actionable)
5. Open Notification Center (two-finger swipe from right edge)
6. Verify FreeBusy notifications appear in history
7. Test notification with different states:
   - Generation success
   - Generation error (disconnect internet)
   - Authentication error (revoke permissions)
8. Test Do Not Disturb impact
9. Test notification settings changes

**Expected Results**:
- [ ] Notifications appear within 2 seconds of events
- [ ] Proper app icon and branding displayed
- [ ] Notification text clear and actionable
- [ ] Notifications appear in Notification Center history
- [ ] Respect system Do Not Disturb settings
- [ ] No duplicate or persistent notifications

**Sample Expected Notifications**:
- "Availability copied to clipboard" (success)
- "No internet connection detected" (error)
- "Google Calendar connection expired" (auth error)

### MAC-001-4: Login Items Integration
**Test Type**: System Integration  
**Priority**: P2 (Medium)  
**Duration**: 10 minutes (requires restart)  

**Objective**: Verify auto-start functionality integrates correctly with macOS Login Items.

**⚠️ Note**: This test requires system restart. Plan accordingly.

**Test Steps**:
1. Open FreeBusy settings → Advanced tab
2. Enable "Start FreeBusy when computer starts"
3. Verify setting saves correctly
4. Open System Preferences > Users & Groups > Login Items
5. Verify FreeBusy appears in login items list
6. Restart macOS (save all other work first)
7. After restart, verify FreeBusy launches automatically
8. Check startup time and resource usage
9. Test disable functionality:
   - Disable in FreeBusy settings
   - Verify removal from system login items
   - Restart to confirm no auto-launch

**Expected Results**:
- [ ] Setting adds FreeBusy to system login items
- [ ] Application launches automatically on startup
- [ ] Startup time ≤5 seconds
- [ ] Menu bar icon appears without main window
- [ ] Memory usage ≤150MB after startup
- [ ] Disable setting removes from login items
- [ ] No auto-launch after disable + restart

## MAC-002: Network and Connectivity Tests

### MAC-002-1: Offline/Online Transition Testing
**Test Type**: Connectivity Resilience  
**Priority**: P1 (High)  
**Duration**: 15 minutes  

**Objective**: Verify FreeBusy handles network connectivity changes gracefully.

**Test Steps**:
1. Ensure FreeBusy authenticated and functional
2. Generate availability successfully (baseline test)
3. Disconnect from WiFi/Network
4. Attempt to generate availability
5. Verify error handling and user feedback
6. Reconnect to network
7. Test automatic recovery
8. Test various network conditions:
   - Very slow connection (use Network Link Conditioner)
   - Intermittent connectivity
   - DNS resolution failures

**Expected Results**:
- [ ] Clear offline error messages displayed
- [ ] Cached data shown when available
- [ ] No application crashes during network changes
- [ ] Automatic retry when connection restored
- [ ] User can manually retry operations
- [ ] Performance degrades gracefully on slow connections

**Network Link Conditioner Setup** (if available):
1. Install Hardware IO Tools from Apple Developer
2. System Preferences > Network Link Conditioner
3. Test with "Very Bad Network" profile

### MAC-002-2: Multiple Network Interface Testing
**Test Type**: Network Resilience  
**Priority**: P2 (Medium)  
**Duration**: 10 minutes  

**Objective**: Test FreeBusy behavior with multiple network interfaces (WiFi + Ethernet, WiFi + Hotspot).

**Test Steps**:
1. Connect Mac to both WiFi and Ethernet (if available)
2. Generate availability successfully
3. Disable primary network interface
4. Verify automatic failover to secondary interface
5. Test with mobile hotspot as backup
6. Monitor for any network-related errors or delays

**Expected Results**:
- [ ] Seamless operation across network interfaces
- [ ] No interruption when primary interface fails
- [ ] No duplicate API calls or authentication issues
- [ ] Consistent performance across interface types

## MAC-003: User Experience and Workflow Tests

### MAC-003-1: First-Time User Complete Journey
**Test Type**: End-to-End User Experience  
**Priority**: P0 (Critical)  
**Duration**: 20 minutes  

**Objective**: Simulate complete first-time user experience from installation through first successful use.

**Pre-conditions**: Fresh macOS user account or complete app reset

**Test Steps**:
1. **Installation Simulation**:
   - Download and install FreeBusy Desktop
   - Launch for first time
   - Note initial impressions and clarity
2. **Onboarding Flow**:
   - Complete welcome screen
   - Authenticate with Google Calendar
   - Configure personal settings
   - Review setup completion
3. **First Use**:
   - Generate first availability table
   - Copy to clipboard
   - Paste into email or text editor
   - Verify result quality
4. **Discovery**:
   - Naturally discover menu bar functionality
   - Explore settings options
   - Test system tray quick generation
5. **User Confidence Assessment**:
   - Rate clarity of setup process
   - Assess security/privacy confidence
   - Evaluate ease of daily use

**Success Criteria**:
- [ ] Setup completed without external help
- [ ] User understands core value proposition
- [ ] Authentication process feels secure
- [ ] First generation successful and useful
- [ ] Menu bar functionality discoverable
- [ ] User expresses confidence in continued use

**User Experience Quality Checklist**:
- [ ] Visual design feels professional and trustworthy
- [ ] Error messages (if any) are helpful and actionable
- [ ] Performance meets user expectations (≤5 seconds generation)
- [ ] Clipboard integration works seamlessly with email workflow
- [ ] Settings options are discoverable but not overwhelming

### MAC-003-2: Daily Power User Workflow Simulation
**Test Type**: Efficiency and Workflow  
**Priority**: P1 (High)  
**Duration**: 15 minutes  

**Objective**: Simulate realistic daily usage patterns for power users prioritizing speed and efficiency.

**Test Scenario**: User needs to share availability multiple times throughout day via email.

**Test Steps**:
1. **Morning Email Response** (Simulate 3 times):
   - Receive email requesting meeting time
   - Use fastest method to generate availability
   - Time from need to email paste
   - Measure interruption to current work
2. **Quick Meeting Setup** (Simulate 2 times):
   - Use keyboard shortcut to generate
   - Share via Slack or instant message
   - Return to previous task
3. **Client Outreach** (Simulate 2 times):
   - Generate availability for external client
   - Include professional booking links
   - Verify meeting details accuracy
4. **Workflow Integration Assessment**:
   - Rate integration into daily routine
   - Identify friction points
   - Note any efficiency improvements over manual process

**Performance Targets**:
- [ ] Menu bar generation: ≤8 seconds total
- [ ] Keyboard shortcut: ≤5 seconds total
- [ ] Main app generation: ≤10 seconds total
- [ ] Context switching minimal (≤5 seconds to return to work)
- [ ] No errors requiring troubleshooting

### MAC-003-3: Error Recovery User Experience
**Test Type**: Error Handling and Recovery  
**Priority**: P1 (High)  
**Duration**: 20 minutes  

**Objective**: Test user experience during various error conditions and recovery processes.

**Test Scenarios**:

**Scenario 1: Network Disconnection**
1. Start availability generation
2. Disconnect network mid-process
3. Observe error handling and user feedback
4. Reconnect network
5. Test recovery process

**Scenario 2: Authentication Expiry**
1. Simulate expired OAuth tokens (may require backend configuration)
2. Attempt availability generation
3. Follow re-authentication process
4. Verify successful recovery

**Scenario 3: Permission Changes**
1. Revoke calendar permissions in Google Account settings
2. Attempt availability generation in FreeBusy
3. Follow permission restoration guidance
4. Verify successful restoration

**Scenario 4: Application Crash Recovery**
1. Force-quit FreeBusy during operation
2. Relaunch application
3. Verify state recovery
4. Test continued functionality

**Recovery Quality Assessment**:
- [ ] Error messages are clear and non-technical
- [ ] Recovery steps are obvious and achievable
- [ ] User maintains confidence in application
- [ ] No data loss or corruption
- [ ] Help resources easily accessible

---

# Phase 2: Enhanced Experience Manual Tests

## MAC-004: Onboarding Wizard Experience

### MAC-004-1: Complete Onboarding Flow Assessment
**Test Type**: User Experience  
**Priority**: P0 (Critical)  
**Duration**: 15 minutes  

**Objective**: Evaluate entire onboarding experience for clarity, efficiency, and user confidence building.

**Test Method**: Fresh user perspective simulation

**Test Steps**:
1. **Step 1 - Welcome Screen**:
   - Rate clarity of value proposition
   - Assess feature list comprehensiveness
   - Note time to decision (proceed or not)
2. **Step 2 - Authentication**:
   - Evaluate security messaging effectiveness
   - Rate comfort level with permission granting
   - Note authentication process friction
3. **Step 3 - Configuration**:
   - Test form usability and validation
   - Verify real-time preview functionality
   - Assess information request reasonableness
4. **Step 4 - Completion**:
   - Rate success confirmation effectiveness
   - Evaluate tip/guidance usefulness
   - Test transition to main application

**Usability Metrics**:
- [ ] Total onboarding time ≤60 seconds
- [ ] No confusion or uncertainty at any step
- [ ] User feels confident about security/privacy
- [ ] Ready to use application independently
- [ ] Would recommend setup process to others

### MAC-004-2: Onboarding Error Scenarios
**Test Type**: Error Handling in Onboarding  
**Priority**: P1 (High)  
**Duration**: 15 minutes  

**Test Steps**:
1. **Authentication Errors**:
   - Simulate network failure during OAuth
   - Test browser failure to open
   - Test OAuth permission denial
2. **Form Validation Errors**:
   - Submit incomplete forms
   - Enter invalid email formats
   - Enter malformed URLs
3. **Recovery Testing**:
   - Verify ability to retry failed steps
   - Test back button functionality
   - Confirm state preservation during errors

**Expected Results**:
- [ ] All error conditions handled gracefully
- [ ] Clear guidance for error resolution
- [ ] Ability to retry without losing progress
- [ ] No crashes or application failures

## MAC-005: Global Keyboard Shortcuts

### MAC-005-1: Keyboard Shortcut System Integration
**Test Type**: System Integration  
**Priority**: P1 (High)  
**Duration**: 15 minutes  

**Objective**: Verify global keyboard shortcuts integrate correctly with macOS and don't conflict with system or other applications.

**Test Steps**:
1. **Registration Testing**:
   - Launch FreeBusy and verify shortcut registration
   - Check System Preferences > Keyboard > Shortcuts for conflicts
   - Test shortcut from various applications:
     - Safari
     - Mail
     - TextEdit
     - Finder
     - Slack/Teams (if installed)
2. **Functionality Testing**:
   - Press Cmd+Shift+G from each test application
   - Verify FreeBusy responds without affecting host application
   - Test shortcut during various system states:
     - Full screen applications
     - Mission Control active
     - During screensaver/lock screen
3. **Conflict Resolution**:
   - Identify any conflicting shortcuts
   - Test custom shortcut assignment
   - Verify shortcut customization persists

**Expected Results**:
- [ ] Shortcut works consistently from all applications
- [ ] No interference with host application functionality
- [ ] No conflicts with system shortcuts
- [ ] Customization options work correctly
- [ ] Shortcut persists across application restarts

### MAC-005-2: Keyboard Shortcut User Experience
**Test Type**: User Experience  
**Priority**: P1 (High)  
**Duration**: 10 minutes  

**Test Steps**:
1. **Speed Testing**:
   - Time from shortcut press to clipboard copy
   - Verify background operation (no window opening)
   - Test during high system load
2. **Feedback Assessment**:
   - Verify appropriate user feedback (notification)
   - Test feedback timing and clarity
   - Rate interruption level to workflow
3. **Accessibility Testing**:
   - Test with VoiceOver enabled
   - Verify shortcut announced correctly
   - Test alternative access methods

**Expected Results**:
- [ ] Total time ≤5 seconds from shortcut to clipboard
- [ ] Minimal workflow interruption
- [ ] Clear completion feedback
- [ ] Accessible to screen reader users

---

# Phase 3 & 4: Advanced Features Manual Tests

## MAC-006: Multi-Account and Advanced Features

### MAC-006-1: Multi-Account Switching Experience
**Test Type**: Multi-Account Functionality  
**Priority**: P2 (Medium)  
**Duration**: 20 minutes  

**Prerequisites**: Access to multiple Google accounts

**Test Steps**:
1. **Account Setup**:
   - Authenticate with primary Google account
   - Add secondary Google account (personal/work)
   - Verify both accounts listed in settings
2. **Switching Testing**:
   - Generate availability for Account A
   - Switch to Account B
   - Generate availability for Account B
   - Verify data separation and accuracy
3. **Persistence Testing**:
   - Restart application
   - Verify account selection preserved
   - Test generation with remembered account
4. **Error Scenarios**:
   - Remove permissions for one account externally
   - Test behavior during account-specific errors
   - Verify error isolation between accounts

**Expected Results**:
- [ ] Account switching ≤3 seconds
- [ ] No data cross-contamination between accounts
- [ ] Clear indication of active account
- [ ] Individual account error handling
- [ ] Account preferences persist correctly

### MAC-006-2: Export Functionality Testing
**Test Type**: File Export and Compatibility  
**Priority**: P2 (Medium)  
**Duration**: 15 minutes  

**Test Steps**:
1. **Export Format Testing**:
   - Generate availability table
   - Export to each supported format:
     - Markdown (.md)
     - HTML (.html)
     - CSV (.csv)
     - Plain text (.txt)
2. **File Quality Assessment**:
   - Open each exported file in appropriate application
   - Verify formatting preservation
   - Test professional appearance
3. **Compatibility Testing**:
   - Import CSV into Numbers/Excel
   - Open HTML in Safari
   - View Markdown in preview applications
   - Test plain text in various editors

**Expected Results**:
- [ ] All export formats generate correctly
- [ ] Professional formatting maintained
- [ ] Files compatible with target applications
- [ ] File naming convention appropriate
- [ ] Export speed ≤5 seconds for all formats

---

# Test Execution Guidelines

## Test Environment Management

### Pre-Test Setup Checklist
- [ ] macOS version verified (10.15+)
- [ ] Google Calendar accounts prepared with test data
- [ ] Network connectivity confirmed
- [ ] System permissions reviewed (Keychain, Notifications)
- [ ] Other calendar applications closed to avoid conflicts
- [ ] System date/time accurate
- [ ] Backup any important clipboard content

### During Testing
- [ ] Record actual vs. expected results for each test
- [ ] Note performance measurements where specified
- [ ] Screenshot any UI issues or unexpected behavior
- [ ] Document system configuration differences affecting results
- [ ] Track user experience qualitative feedback

### Post-Test Cleanup
- [ ] Remove test entries from Keychain if needed
- [ ] Clear notification history
- [ ] Reset application settings to defaults
- [ ] Document any system changes made during testing

## Issue Reporting Template

### Issue Report Format
```
**Issue ID**: MAC-XXX-X
**Test Case**: [Reference test case]
**Severity**: P0/P1/P2/P3
**Environment**: macOS [version], [Mac model]

**Steps to Reproduce**:
1. [Detailed steps]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Videos**:
[Attach visual evidence]

**System Info**:
- macOS Version:
- FreeBusy Version:
- Network Condition:
- Other Relevant Apps:

**Workaround** (if any):
[Temporary solution]
```

## Success Criteria Summary

### Critical Success Metrics (Must Pass)
- [ ] First-time user setup completion rate >90%
- [ ] Menu bar integration 100% functional
- [ ] Security: No token exposure in files/logs
- [ ] Performance: Generation time ≤5 seconds
- [ ] Stability: No crashes during normal operation

### Important Success Metrics (Should Pass)
- [ ] Keyboard shortcuts work across all major apps
- [ ] Network error recovery >85% success rate
- [ ] Onboarding flow completion time ≤60 seconds
- [ ] User confidence in security/privacy high
- [ ] Daily workflow integration seamless

### Desirable Success Metrics (Good to Pass)
- [ ] Multi-account switching ≤3 seconds
- [ ] Export functionality 100% compatible
- [ ] Advanced features discoverable and usable
- [ ] Memory usage ≤150MB
- [ ] User would recommend to others

---

This manual testing plan ensures comprehensive validation of FreeBusy Desktop's macOS integration, user experience, and functionality that cannot be captured through automated testing alone.