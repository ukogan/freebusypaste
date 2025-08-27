# FreeBusy Calendar - Detailed User Flows

## Flow 1: First-Time User Setup (Complete Journey)

### Entry Points
- **Primary**: Application launched for first time after installation
- **Secondary**: User clicks "Get Started" from welcome screen

### Pre-conditions
- Application installed on desktop
- User has Google Calendar account
- Internet connection available

### Step-by-Step Flow

#### Phase 1: Welcome & Introduction
1. **Welcome Screen Display**
   - User sees welcome screen with app branding
   - Large calendar icon (📅) prominently displayed
   - Main headline: "Welcome to FreeBusy Calendar"
   - Subtitle: "Share your availability in seconds, not minutes"
   - Feature checklist with checkmark icons:
     - ✓ Connect your Google Calendar securely
     - ✓ Generate availability tables instantly
     - ✓ One-click copying to clipboard
     - ✓ Professional booking links for clients

2. **User Decision Point**
   - **Primary Action**: "Get Started" button (blue, prominent)
   - **Secondary Action**: "Learn More" link (optional, opens help)
   - **Exit Action**: Close button (user can quit setup)

#### Phase 2: Google Authentication
3. **Authentication Explanation**
   - Screen title: "Connect Your Google Calendar"
   - Reassuring subtitle: "We need read-only access to check when you're busy"
   - Two security information boxes:
     - 🛡️ "Your Privacy is Protected" - explains data privacy
     - 🔒 "Read-Only Access" - explains limited permissions
   - **User Action**: Click "Connect Google Calendar" button

4. **OAuth Flow Initiation**
   - Button shows loading state: "Connecting..." with spinner
   - System opens default browser
   - Google OAuth consent screen appears in browser
   - User sees permission request for "See your calendar availability"

5. **Authentication Outcomes**
   - **Success Path**: 
     - Browser returns to app with success
     - Button shows "✓ Connected Successfully" in green
     - Auto-advance to next step after 1.5 seconds
   - **Error Paths**:
     - User denies permission → Show error message with retry option
     - Network error → Show connection error with retry option
     - Browser doesn't open → Show manual URL with instructions

#### Phase 3: Personal Configuration
6. **Configuration Form Display**
   - Screen title: "Tell Us About Yourself"
   - Subtitle: "These details will appear in your booking links"
   - Form fields (pre-populated when possible):
     - Email address (pre-filled from Google account)
     - Meeting title template (default: "Meeting with [User]")
     - Zoom/meeting link (empty, requires user input)
     - Available hours (dropdowns for start/end times)

7. **Real-time Preview**
   - Preview box shows formatted meeting details
   - Updates live as user types
   - Example: "Meeting: Meeting with Uri, Zoom: [link], Attendee: user@email.com"

8. **Configuration Completion**
   - **Primary Action**: "Save & Continue" (validates and proceeds)
   - **Secondary Action**: "Skip for Now" (uses defaults, can configure later)
   - **Validation**: Required fields highlighted if empty

#### Phase 4: Setup Complete
9. **Success Confirmation**
   - Animated green checkmark (✓) with pulse effect
   - Title: "You're All Set!"
   - Subtitle: "FreeBusy is ready to streamline your scheduling"
   - Tips list with light bulb icons:
     - 💡 Click "Generate Availability" to create your first table
     - 💡 Results are automatically copied to your clipboard
     - 💡 Use the system tray for quick access anytime
     - 💡 Adjust settings anytime by clicking the gear icon

10. **Final Actions**
    - **Primary Action**: "Generate My First Availability" (goes to main app)
    - **Secondary Action**: "Explore Settings" (opens settings panel)

### Success Criteria
- User completes authentication successfully
- Basic configuration saved (email, business hours)
- User understands core functionality
- Ready to generate first availability table

### Error Recovery Paths
- **Authentication fails**: Clear retry button, help link to troubleshooting
- **Network issues**: Offline mode explanation, retry when connected
- **Configuration errors**: Inline validation with helpful error messages

---

## Flow 2: Daily Power User Flow (Quick Generation)

### Entry Points
- System tray right-click → "Quick Generate"
- Desktop shortcut double-click
- Keyboard shortcut (Ctrl+Shift+G)
- Main app → "Generate Availability" button

### Pre-conditions
- User previously authenticated
- Valid OAuth tokens (not expired)
- Internet connection available
- System tray enabled (for tray entry points)

### Step-by-Step Flow

#### Path A: System Tray Quick Generate (Fastest Path)
1. **Tray Interaction**
   - User right-clicks FreeBusy tray icon
   - Context menu appears with options:
     - ⚡ Quick Generate (highlighted)
     - 📋 Copy Last Result
     - 🏠 Show App
     - ⚙️ Settings
     - ❌ Quit FreeBusy

2. **Quick Generation Process**
   - User clicks "Quick Generate"
   - Tray icon shows subtle animation (pulsing)
   - System works in background (no window opens)
   - Process time: ~2-5 seconds typically

3. **Completion Feedback**
   - System notification appears: "Availability copied to clipboard"
   - Tray icon briefly shows green indicator
   - User is ready to paste into email immediately
   - **Total time**: ~5-8 seconds from intent to clipboard

#### Path B: Desktop Shortcut (Quick Access)
1. **Shortcut Activation**
   - User double-clicks desktop shortcut
   - Main application window opens (if not already open)
   - Auto-focuses on "Generate Availability" button

2. **One-Click Generation**
   - User clicks generate button OR presses Enter
   - Button shows loading state: "Checking calendar..."
   - Progress indication appears

3. **Results Display**
   - Availability table appears in main window
   - Auto-copy to clipboard occurs
   - Success message: "✅ Availability copied to clipboard!"
   - Window can auto-minimize (user preference)

#### Path C: Keyboard Power User
1. **Global Shortcut**
   - User presses Ctrl+Shift+G from anywhere
   - App generates availability in background
   - Desktop notification confirms completion

### Success Criteria
- Availability generated within 5 seconds
- Results automatically copied to clipboard
- Clear confirmation provided to user
- User can immediately paste into email

### Error Handling
- **Token expired**: Silent re-authentication if possible, notification if user action required
- **Network issues**: Cache last result if available, clear error message if not
- **Calendar access issues**: Helpful error with link to fix permissions

---

## Flow 3: Settings Configuration Flow

### Entry Points
- Main app → Settings button (⚙️)
- System tray → "Settings"
- First-run setup → "Explore Settings"
- Keyboard shortcut (Ctrl+,)

### Pre-conditions
- Application running
- User has completed initial setup

### Step-by-Step Flow

#### Settings Panel Access
1. **Settings Panel Open**
   - Modal overlay appears over main window
   - Smooth slide-in animation from right
   - Tabbed interface with 4 sections:
     - Account | Personal | Schedule | Advanced

2. **Navigation Between Tabs**
   - Click tab headers to switch sections
   - Keyboard navigation: Tab/Shift+Tab, Left/Right arrows
   - Active tab highlighted with blue underline
   - Content area updates with smooth transition

#### Tab 1: Account Management
3. **Connection Status Review**
   - Green status indicator: "✓ Connected to Google Calendar"
   - Shows connected email: "ukogan@rzero.com"
   - Expiration warning: "Access expires in 7 days"
   - **Actions Available**:
     - "Reconnect" button (refreshes tokens)
     - "Revoke Access" button (disconnects, requires re-auth)
     - "Switch Account" button (multi-account support)

#### Tab 2: Personal Information
4. **Profile Configuration**
   - Form fields for personal details:
     - Email address (used in calendar invites)
     - Meeting title template
     - Zoom/meeting link
     - Optional meeting description
   - **Real-time Validation**:
     - Email format checking
     - URL validation for meeting links
     - Character limits displayed
   - **Preview Feature**:
     - Live preview of how meeting invites will look

#### Tab 3: Schedule Preferences
5. **Business Hours Setup**
   - Start/end time dropdowns
   - Weekend availability checkboxes
   - Meeting duration selector (15/30/45/60 minutes)
   - Default date range (3/5/7/14 days)
   - Time zone display (auto-detected)

#### Tab 4: Advanced Options
6. **Behavior Settings**
   - Auto-copy to clipboard (checkbox)
   - Minimize after copy (checkbox)
   - Desktop notifications (checkbox)
   - Start with system (checkbox)
   - Calendar refresh frequency (dropdown)
   - **Data Management**:
     - Cache offline data (checkbox)
     - Export settings button
     - Reset to defaults button

#### Settings Application
7. **Saving Changes**
   - **Apply Button**: Saves changes, keeps settings open
   - **Save & Close Button**: Saves and closes settings panel
   - **Cancel Button**: Discards changes, closes panel
   - **Auto-save**: Some changes apply immediately (notifications, UI preferences)

8. **Validation and Feedback**
   - Required fields highlighted if empty
   - Success toast: "Settings saved successfully"
   - Error messages inline with specific guidance
   - Changes reflected immediately in main app

### Success Criteria
- User can easily find and modify settings
- Changes persist between app sessions  
- Clear feedback for all actions
- Settings take effect immediately when appropriate

### Error Scenarios
- **Invalid inputs**: Clear validation messages with correction guidance
- **Permission changes**: Clear explanation of what changed and why
- **Network issues**: Offline mode limitations explained

---

## Flow 4: Error Recovery Flows

### Authentication Error Recovery

#### Scenario: Expired Tokens
1. **Error Detection**
   - User attempts to generate availability
   - System detects expired OAuth tokens
   - Generation fails gracefully

2. **User Notification**
   - Clear error message: "Google Calendar connection expired"
   - Explanation: "Please reconnect to continue using FreeBusy"
   - **Primary Action**: "Reconnect Google Calendar" button

3. **Re-authentication Process**
   - Same OAuth flow as initial setup
   - Browser opens with Google consent
   - Success returns to previous action
   - **Fallback**: Manual token entry if browser fails

#### Scenario: Permission Denied
1. **Permission Issue Detection**
   - API returns permission denied error
   - System identifies specific permission issue

2. **Helpful Error Message**
   - "Calendar access denied"
   - "FreeBusy needs calendar permissions to work"
   - **Primary Action**: "Review Permissions" (links to Google account)
   - **Secondary Action**: "Reconnect" (tries OAuth again)

### Network Error Recovery

#### Scenario: No Internet Connection
1. **Connection Detection**
   - System detects network unavailability
   - Generation attempt fails

2. **User Feedback**
   - Error message: "No internet connection detected"
   - Suggestion: "Check your connection and try again"
   - **Primary Action**: "Retry" button
   - **Secondary Action**: "Work Offline" (if cached data available)

3. **Offline Mode**
   - Shows last generated availability if cached
   - Clear indication: "Showing cached data from [timestamp]"
   - Limited functionality warning
   - Auto-retry when connection restored

#### Scenario: API Rate Limits
1. **Rate Limit Detection**
   - Google API returns rate limit error
   - System identifies temporary restriction

2. **User Communication**
   - Error message: "Calendar service temporarily busy"
   - Explanation: "Please try again in a few minutes"
   - **Action**: "Retry in 2 minutes" (countdown timer)

### System Error Recovery

#### Scenario: Application Crash
1. **Crash Detection**
   - App restarts after unexpected closure
   - System checks for unsaved state

2. **Recovery Process**
   - Welcome back message: "FreeBusy recovered from unexpected closure"
   - **Actions**:
     - "Generate Fresh Availability" (clear restart)
     - "Send Error Report" (help improve app)
     - "Continue Normally" (default)

### Success Criteria for Error Flows
- Users understand what went wrong
- Clear path to resolution provided
- No data loss during errors
- System recovers gracefully
- User confidence maintained

---

## Flow 5: System Tray Interactions (Advanced Users)

### System Tray Menu Structure
```
📅 FreeBusy Calendar
├─ ⚡ Quick Generate
├─ 📋 Copy Last Result  
├─ ──────────────────
├─ 🏠 Show App
├─ ⚙️ Settings
├─ ❓ Help
├─ ──────────────────
└─ ❌ Quit FreeBusy
```

### Interaction Flows

#### Quick Generate Flow
1. **Menu Access**: Right-click tray icon
2. **Quick Select**: Click "Quick Generate"
3. **Background Processing**: No window opens, works silently
4. **Completion**: Desktop notification + tray icon animation
5. **Result**: Availability in clipboard, ready to paste

#### Copy Last Result Flow
1. **Use Case**: User needs to re-copy previous generation
2. **Action**: Click "Copy Last Result" 
3. **Feedback**: Brief notification "Previous availability copied"
4. **Limitation**: Only available if previous generation exists

#### Show/Hide App Flow
1. **Show App**: Opens main window, brings to front
2. **Hide App**: Minimizes to tray (if main window visible)
3. **State Management**: Remembers window position/size
4. **Focus Handling**: Proper keyboard focus management

### System Tray States
- **Default**: Standard calendar icon
- **Generating**: Subtle pulsing animation
- **Success**: Brief green overlay
- **Error**: Brief red overlay  
- **Offline**: Dimmed/grayed icon

### Success Criteria
- Power users can work entirely from tray
- Visual feedback for all states
- Minimal interruption to workflow
- Reliable background operation

---

## User Flow Success Metrics

### Quantitative Metrics
- **First-time setup completion rate**: Target >90%
- **Time to first successful generation**: Target <60 seconds
- **Daily power user flow completion**: Target <10 seconds
- **Error recovery success rate**: Target >85%
- **Settings configuration completion**: Target >95%

### Qualitative Success Indicators
- User expresses confidence in security/privacy
- User understands core functionality after setup
- User can recover from common errors independently  
- User adopts power-user features (tray, shortcuts)
- User successfully integrates into daily workflow

### Critical User Experience Requirements
1. **Clarity**: Each step has clear purpose and outcome
2. **Feedback**: User always knows what's happening
3. **Recovery**: Every error state has clear resolution path
4. **Efficiency**: Power users can bypass UI for speed
5. **Security**: User trusts the application with calendar access
6. **Reliability**: Functions work consistently across sessions