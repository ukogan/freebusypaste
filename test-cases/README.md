# FreeBusy Desktop - Test Suite

This directory contains comprehensive test cases for the FreeBusy Desktop application, covering all phases of development with both automated and manual testing approaches.

## Test Suite Overview

### Test Structure
```
test-cases/
├── comprehensive-test-plan.md       # Complete test strategy and requirements
├── manual-test-scenarios.md         # macOS-specific manual tests
├── test-config.js                   # Centralized test configuration
├── playwright-tests/                # E2E automated tests
├── jest-unit-tests/                 # Unit tests
└── setup/                           # Test environment setup
```

## Quick Start

### Prerequisites
- macOS 10.15+ (Catalina or later)
- Node.js 18.x LTS
- Electron 27.x
- Google Calendar account for testing

### Installation
```bash
# Install test dependencies
npm install --save-dev playwright @playwright/test jest electron

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Unit Tests (Jest)
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- auth-manager.test.js

# Run with coverage
npm run test:unit:coverage

# Watch mode for development
npm run test:unit:watch
```

#### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suite
npm run test:e2e -- authentication.test.js

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug -- "should complete OAuth flow"
```

#### Manual Tests
```bash
# Generate manual test report template
npm run test:manual:template

# Validate manual test results
npm run test:manual:validate
```

## Test Categories

### Phase 1: MVP Tests (Priority P0-P1)
**Focus**: Core functionality, authentication, basic availability generation

- **AUTH-001 to AUTH-009**: OAuth authentication flow
- **AVAIL-001 to AVAIL-010**: Availability generation
- **CLIP-001 to CLIP-005**: Clipboard integration  
- **MAC-001 to MAC-003**: macOS system integration

**Run Phase 1 tests:**
```bash
npm run test:phase1
```

### Phase 2: Enhanced Experience (Priority P1-P2)
**Focus**: Onboarding, booking links, keyboard shortcuts, notifications

- **ONBOARD-001 to ONBOARD-002**: Onboarding wizard
- **BOOK-001 to BOOK-002**: Booking link generation
- **SHORTCUT-001 to SHORTCUT-002**: Global keyboard shortcuts
- **ERROR-001 to ERROR-004**: Enhanced error handling

**Run Phase 2 tests:**
```bash
npm run test:phase2
```

### Phase 3-4: Advanced Features (Priority P2-P3)
**Focus**: Multi-account, exports, templates, analytics

- **MULTI-001 to MULTI-002**: Multi-account support
- **EXPORT-001 to EXPORT-002**: File export functionality
- **TEMPLATE-001 to TEMPLATE-002**: Scheduling templates
- **ANALYTICS-001 to ANALYTICS-002**: Usage analytics

**Run Advanced tests:**
```bash
npm run test:advanced
```

## Test Configuration

### Environment Setup
Tests can be configured for different environments:

```javascript
// test-config.js
environments: {
  development: {
    googleApiEndpoint: 'https://www.googleapis.com',
    logLevel: 'debug',
    enableMocking: true
  },
  production: {
    logLevel: 'error', 
    enableMocking: false
  }
}
```

### Mock Data
Standardized test data is available in `test-config.js`:

```javascript
// Calendar events for testing
testData.calendarEvents.typical    // Normal busy/free periods
testData.calendarEvents.empty      // No events
testData.calendarEvents.fullyBooked // No availability
testData.userSettings.default      // Standard user configuration
```

## Automated Test Implementation

### Unit Tests (Jest)
Located in `jest-unit-tests/`, focusing on:
- Authentication logic
- Availability calculation algorithms
- Data processing and validation
- Error handling mechanisms

**Example:**
```javascript
test('AUTH-UNIT-001: Should initiate OAuth flow successfully', async () => {
  const authUrl = await authManager.initiateOAuth();
  expect(authUrl).toMatch(/^https:\/\/accounts\.google\.com/);
});
```

### E2E Tests (Playwright)
Located in `playwright-tests/`, covering:
- Complete user workflows
- UI interactions and feedback
- System integration scenarios
- Cross-browser OAuth testing

**Example:**
```javascript
test('AUTH-001: Complete first-time Google Calendar authentication', async () => {
  const { page } = await launchApp();
  await page.click('button:has-text("Connect Google Calendar")');
  await expect(page.locator('text=Connected Successfully')).toBeVisible();
});
```

## Manual Testing

### macOS-Specific Tests
Critical functionality that requires manual validation:

- **Keychain Integration**: OAuth tokens stored securely
- **Menu Bar Integration**: System tray functionality
- **Notification Center**: Desktop notifications
- **Login Items**: Auto-start configuration

### User Experience Testing
Qualitative assessment of:
- First-time user onboarding flow
- Daily power user workflows  
- Error recovery experiences
- Accessibility compliance

### Performance Testing
Manual validation of:
- Application startup time (<3 seconds)
- Availability generation speed (<5 seconds)
- Memory usage monitoring (<150MB)
- Resource cleanup verification

## Test Data Management

### Google Calendar Test Data
Prepare test calendars with:
- **Empty calendar**: No events for full availability testing
- **Typical calendar**: Mix of busy/free periods
- **Busy calendar**: Fully booked for edge case testing
- **Complex calendar**: All-day events, recurring events, multiple calendars

### OAuth Test Accounts
Maintain separate accounts for:
- **Primary testing**: Main development testing
- **Secondary testing**: Multi-account feature testing  
- **Expired tokens**: Authentication error testing
- **Restricted permissions**: Permission error testing

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
      - run: npm run test:e2e
```

### Coverage Requirements
- **Unit tests**: 85% coverage for main logic
- **Integration tests**: 70% coverage for workflows
- **E2E tests**: 100% coverage for critical paths

## Test Reporting

### Automated Reports
```bash
# Generate comprehensive test report
npm run test:report

# Coverage report with HTML output  
npm run test:coverage:html

# Performance benchmark report
npm run test:performance
```

### Manual Test Reports
Use provided templates in `manual-test-scenarios.md` to document:
- Test execution results
- Performance measurements
- User experience observations
- System integration verification

## Debugging Tests

### Debug Configuration
```bash
# Debug Playwright tests
npm run test:e2e:debug

# Debug with DevTools
npm run test:e2e:devtools

# Run specific test with verbose output
npm run test:unit -- --verbose auth-manager.test.js
```

### Common Debug Scenarios
- **OAuth failures**: Check browser console, network tabs
- **Electron app crashes**: Review main process logs
- **Timing issues**: Add explicit waits, check selectors
- **Mock failures**: Verify mock setup and responses

## Performance Benchmarking

### Automated Performance Tests
```bash
# Run performance benchmark suite
npm run test:performance

# Memory usage profiling
npm run test:memory

# Startup time measurement
npm run test:startup
```

### Performance Targets
- **Application startup**: ≤3 seconds
- **OAuth flow completion**: ≤30 seconds  
- **Availability generation**: ≤5 seconds
- **Clipboard copy**: ≤1 second
- **Memory usage**: ≤150MB steady state

## Security Testing

### Security Validation
- **Token storage**: Verify Keychain integration
- **Data exposure**: Check for sensitive data in logs/files
- **Network security**: Validate HTTPS usage
- **Permission scope**: Confirm minimal calendar access

### Security Test Commands
```bash
# Run security-focused test suite
npm run test:security

# Validate token storage security
npm run test:keychain

# Check for data exposure
npm run test:privacy
```

## Contributing to Tests

### Adding New Tests
1. **Identify test category**: Unit, Integration, or E2E
2. **Follow naming convention**: `CATEGORY-###: Description`
3. **Use test config**: Import from `test-config.js`
4. **Document expectations**: Clear success criteria
5. **Include error scenarios**: Test failure conditions

### Test Quality Guidelines
- **Isolation**: Tests should not depend on each other
- **Determinism**: Results should be consistent
- **Speed**: Unit tests <1s, E2E tests <30s
- **Clarity**: Test names and assertions should be self-documenting
- **Coverage**: Test both happy path and error conditions

### Code Review Checklist
- [ ] Test covers acceptance criteria
- [ ] Error conditions included
- [ ] Performance implications considered
- [ ] Manual test scenarios documented
- [ ] CI configuration updated if needed

## Troubleshooting

### Common Issues

**"Electron app fails to launch"**
- Verify Node.js version (18.x required)
- Check Electron installation
- Review main process code for syntax errors

**"OAuth tests fail in CI"**
- Confirm browser installation (`npx playwright install`)
- Check network restrictions in CI environment
- Verify mock OAuth endpoints configured

**"Keychain tests fail"**
- Tests must run on macOS
- User session must be unlocked
- Keychain Access permissions may need reset

**"Performance tests inconsistent"**
- Run on dedicated hardware when possible
- Account for system load variations
- Use average of multiple runs

### Getting Help
- Review test documentation in each directory
- Check existing GitHub issues for similar problems
- Run tests with verbose output for debugging
- Use community resources for Playwright/Jest issues

---

This comprehensive test suite ensures FreeBusy Desktop meets all functional, performance, and security requirements across its development phases. The combination of automated and manual testing provides confidence in the application's reliability and user experience on macOS platforms.