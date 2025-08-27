# FreeBusy Desktop - Product Requirements Document

## Project Overview

Transform FreeBusy from a Python CLI tool to a professional Electron desktop application that enables instant calendar availability sharing through system tray quick access and clipboard integration.

## Product Vision

FreeBusy Desktop eliminates the friction in scheduling meetings by providing one-click availability generation. Users can instantly share professional availability tables via clipboard or booking links without context switching.

## Development Phases

### Phase 1: Core Desktop Application (MVP)
**Duration**: 2-3 weeks  
**Goal**: Replace CLI with desktop equivalent functionality

#### User Stories
- As a user, I want to authenticate with Google Calendar once so I can securely access my availability
- As a user, I want to click a single button to generate my availability table so I can copy it immediately
- As a user, I want my availability automatically copied to clipboard so I can paste it into emails instantly
- As a user, I want to configure my meeting details (title, Zoom link, hours) so booking requests have correct information
- As a user, I want the app to minimize to system tray so it doesn't clutter my desktop

#### Success Criteria
- One-click availability generation (≤5 seconds)
- Automatic clipboard copying
- Secure OAuth2 authentication with Google Calendar
- Basic settings configuration (email, meeting title, business hours, Zoom link)
- System tray integration with context menu

### Phase 2: Booking Links & Enhanced Experience
**Duration**: 2-3 weeks  
**Goal**: Add professional booking links and improve user interface

#### User Stories
- As a user, I want to generate booking links so clients can schedule meetings directly
- As a first-time user, I want guided onboarding so I can understand and configure the app correctly
- As a power user, I want keyboard shortcuts so I can generate availability without opening the app
- As a user, I want desktop notifications so I know when generation completes
- As a user, I want to see generation status and error messages so I understand what's happening

#### Success Criteria
- Professional booking link generation
- 4-step onboarding completion rate >90%
- Global keyboard shortcut (Cmd+Shift+G) functionality
- Clear error handling with recovery options
- Visual feedback for all user actions

### Phase 3: Advanced Scheduling Features
**Duration**: 1-2 weeks  
**Goal**: Extended scheduling options and customization

#### User Stories
- As a user, I want weekend availability options so I can include Saturdays/Sundays when needed
- As a user, I want to customize availability table formats so I can match my communication style
- As a user, I want offline mode so I can access cached availability without internet
- As a user, I want to export availability to files so I can save or share formatted tables

#### Success Criteria
- Extended scheduling options (weekends, custom date ranges)
- Multiple export formats (Markdown, HTML, CSV)
- Offline functionality with cached data
- Advanced customization options

### Phase 4: Professional Multi-Account Features
**Duration**: 2-3 weeks  
**Goal**: Enterprise-level features for power users

#### User Stories
- As a user, I want multi-account support so I can manage personal and work calendars separately
- As a user, I want advanced calendar filtering so I can exclude specific calendars from availability
- As a user, I want scheduling templates so I can quickly switch between different availability patterns
- As a user, I want usage analytics so I can understand my scheduling patterns

#### Success Criteria
- Multi-calendar account management
- Calendar filtering and selection
- Scheduling template system
- Local usage analytics dashboard

## Functional Requirements

### Authentication & Security
- OAuth2 integration with Google Calendar API
- Secure token storage in OS keychain
- Read-only calendar access permissions
- Session management with automatic re-authentication
- Encryption for sensitive configuration data

### Calendar Integration
- Real-time calendar availability checking
- Configurable business hours (start/end time)
- Meeting duration settings (15/30/45/60 minutes)
- Weekend availability toggles
- Date range selection (3/5/7/14 days)
- Timezone handling and display

### User Interface
- Native desktop application (Electron)
- System tray with quick actions menu
- Modal settings panel with 4 tabs:
  - Account: Authentication status, permissions
  - Personal: Email, meeting title, Zoom link, description
  - Schedule: Business hours, duration, date range, weekends
  - Advanced: Behavior settings, data management
- Main window: Generation button, availability table display
- Onboarding wizard for first-time setup

### Core Functionality
- One-click availability generation
- Automatic clipboard copying
- Visual availability table display
- Real-time preview of meeting details
- Background calendar data refresh
- Error handling with user-friendly messages

### System Integration
- Auto-start with operating system option
- Desktop notifications for completion/errors
- Global keyboard shortcuts (macOS native)
- Window state persistence
- macOS-native features (menu bar, dock integration)

## Technical Requirements

### Performance
- Availability generation: ≤5 seconds
- Application startup: ≤3 seconds
- Memory usage: ≤150MB
- Calendar data refresh: Configurable (5/15/30/60 minutes)

### Reliability
- Graceful offline mode with cached data
- Automatic error recovery for network issues
- Token refresh handling
- Application crash recovery
- Data backup and restore capabilities

### Security
- No calendar content access (availability only)
- Encrypted local data storage
- Secure API key management
- Rate limiting compliance with Google APIs
- Privacy-first data handling

### Compatibility
- Node.js 18+ runtime
- Electron framework
- Google Calendar API v3
- macOS keychain integration (keytar/electron-store)
- macOS 10.15+ (Catalina and later)

## User Experience Requirements

### First-Time Setup
- 4-step onboarding wizard (≤60 seconds completion)
- Clear privacy and security messaging
- Pre-populated configuration when possible
- OAuth flow explanation and guidance
- Success confirmation with next steps

### Daily Usage Flows
- System tray quick generation (≤8 seconds total)
- Desktop shortcut access
- Global keyboard shortcut
- Main application window workflow
- Multiple entry points for different user preferences

### Error Recovery
- Clear error messages with specific guidance
- Automatic retry mechanisms where appropriate
- Network connectivity handling
- Authentication expiry management
- Permission issues resolution

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Configurable font sizes
- WCAG 2.1 AA compliance

## Success Metrics

### Quantitative Metrics
- First-time setup completion: >90%
- Time to first generation: <60 seconds
- Daily power user flow: <10 seconds
- Error recovery success: >85%
- User retention (30-day): >70%

### Qualitative Indicators
- User confidence in security/privacy
- Feature adoption (tray usage, shortcuts)
- Integration into daily workflow
- Reduced scheduling friction
- Professional presentation quality

## Current Development Status (Updated 2025-08-27)

### **Phase 1: Core Desktop Application (MVP) - ✅ COMPLETE**

#### Completed Components ✅
- **Electron Application Structure**: Main app framework implemented (`main/app.js`)
- **Authentication Framework**: OAuth2 managers created (`oauth-manager-v2.js`, demo mode support)
- **Calendar Integration**: Availability generator with Google Calendar API integration
- **Settings Management**: Persistent settings storage with electron-store
- **System Tray Integration**: Menu bar manager implemented for macOS
- **Development Environment**: Complete build system, testing framework, and dev tools
- **Demo Mode**: Functional demo mode for testing without Google credentials
- **UI Components**: Complete renderer implementation with main window and settings panel
- **Frontend UI Implementation**: Full main window and settings panel UI completed
- **IPC Communication**: Complete main-to-renderer process communication
- **Error Handling**: Comprehensive error handling and user feedback system
- **Authentication Flow**: OAuth callback server and token management integrated
- **Clipboard Integration**: macOS clipboard integration with automatic copying
- **End-to-End Testing**: Complete integration testing with 16/16 unit tests passing
- **First-Run Experience**: Onboarding flow implemented with user guidance

**Phase 1 Progress: ✅ 100% Complete - MVP READY**

---

### **Next Phases Status**

#### Phase 2: Booking Links & Enhanced UX - PLANNED
- **Status**: Architecture designed, ready for implementation
- **Dependencies**: Phase 1 completion
- **Key Components**: Onboarding wizard, global shortcuts, notifications

#### Phase 3: Advanced Scheduling - PLANNED  
- **Status**: Requirements defined, technical approach documented
- **Dependencies**: Phase 2 completion

#### Phase 4: Multi-Account Features - PLANNED
- **Status**: Conceptual design completed
- **Dependencies**: Phase 3 completion

---

## Acceptance Criteria

### Phase 1 (MVP) Completion - ✅ **100% COMPLETE**
- [x] **Electron App Framework**: Core application structure and managers
- [x] **Google Calendar API Integration**: OAuth and availability fetching
- [x] **Settings Persistence**: User configuration storage and management  
- [x] **System Tray Integration**: macOS menu bar integration
- [x] **Demo Mode**: Development and testing without Google credentials
- [x] **One-click Availability Generation**: Complete UI-to-clipboard workflow
- [x] **Automatic Clipboard Copying**: Integration with macOS clipboard
- [x] **Error Handling & Recovery**: User-friendly error messages and recovery
- [x] **Complete Authentication Flow**: OAuth server and token management

### Phase 2 (Booking Links & Enhanced UX) Completion - **NOT STARTED**
- [ ] Professional booking link generation
- [ ] Complete onboarding wizard
- [ ] Global keyboard shortcuts
- [ ] Desktop notifications
- [ ] Error handling with recovery

### Phase 3 (Advanced Scheduling) Completion - **NOT STARTED**
- [ ] Weekend/custom scheduling options
- [ ] Multiple export formats
- [ ] Offline mode with caching
- [ ] Advanced customization options

### Phase 4 (Multi-Account Features) Completion - **NOT STARTED**
- [ ] Multi-account support
- [ ] Calendar filtering and selection
- [ ] Scheduling templates
- [ ] Usage analytics dashboard

## Risk Mitigation

### High-Priority Risks
1. **Google API Rate Limits**: Implement intelligent caching and request batching
2. **OAuth Token Management**: Robust token refresh and error handling
3. **User Adoption**: Focus on seamless onboarding and clear value proposition
4. **macOS System Integration**: Ensure proper keychain and notification access

### Technical Derisking
- Build core calendar integration first
- Create comprehensive error handling framework
- Implement offline fallback mode early
- Test system tray and macOS native features thoroughly

## Dependencies

### External Services
- Google Calendar API (primary dependency)
- OS keychain services
- Electron auto-updater infrastructure

### Development Tools
- Node.js ecosystem (Electron, googleapis)
- Build tools (electron-builder)
- Testing framework (Jest, Playwright)
- macOS development environment

## Timeline

### Original Timeline vs. Current Status

| Phase | Original Plan | Current Status | Revised Timeline |
|-------|---------------|----------------|------------------|
| **Phase 1 (MVP)** | Weeks 1-3 | 70% Complete | **Week 2-3** (complete remaining 30%) |
| **Phase 2 (Enhanced UX)** | Weeks 4-6 | Not Started | **Weeks 4-6** (on track) |
| **Phase 3 (Advanced Features)** | Weeks 7-8 | Not Started | **Weeks 7-8** (on track) |
| **Phase 4 (Multi-Account)** | Weeks 9-11 | Not Started | **Weeks 9-11** (on track) |
| **Testing/Polish** | Weeks 12-13 | Ongoing | **Weeks 12-13** (on track) |

### Updated Milestones (from 2025-08-27)

- **Phase 1 Completion**: Week 3 (1 week remaining)
  - Complete UI integration and clipboard functionality
  - Finalize OAuth flow and error handling
  - End-to-end testing of core workflow

- **Phase 2**: Weeks 4-6 (Ready to begin after Phase 1)
- **Phase 3**: Weeks 7-8 (On schedule)
- **Phase 4**: Weeks 9-11 (On schedule)

**Total estimated timeline: 13 weeks for full feature set** (unchanged)