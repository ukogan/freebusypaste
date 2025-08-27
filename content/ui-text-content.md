# FreeBusy Calendar - Complete UI Text Content

## Application Labels & Buttons

### Primary Actions
- **Generate Availability** (main CTA button)
- **Copy to Clipboard** (secondary action)
- **Get Started** (onboarding)
- **Connect Google Calendar** (authentication)
- **Save & Close** (settings)
- **Apply** (settings - immediate effect)
- **Cancel** (discard changes)

### Navigation & Menu Items
- **Settings** (gear icon tooltip)
- **Account** (settings tab)
- **Personal** (settings tab)
- **Schedule** (settings tab)  
- **Advanced** (settings tab)
- **Help** (system tray and main menu)
- **About FreeBusy** (information dialog)
- **Quit FreeBusy** (system tray)

### System Tray Menu
- **📅 FreeBusy Calendar** (header, non-clickable)
- **⚡ Quick Generate** (primary tray action)
- **📋 Copy Last Result** (repeat last action)
- **🏠 Show App** (bring window to front)
- **⚙️ Settings** (open settings panel)
- **❓ Help** (open help documentation)
- **❌ Quit FreeBusy** (close application)

### Status Indicators
- **Connected as: user@email.com** (authentication status)
- **Last updated: X minutes ago** (data freshness)
- **Authentication expires: In X days** (token warning)
- **Checking availability for: [date range]** (current operation)
- **Found X busy periods** (calendar analysis result)

---

## Form Fields & Placeholders

### User Configuration Forms
**Email Address**
- Label: "Email Address"
- Placeholder: "your@company.com"
- Help text: "This email will be added to calendar invitations"

**Meeting Title Template**
- Label: "Meeting Title Template"
- Placeholder: "Meeting with [Your Name]"
- Help text: "Default title for calendar invitations"

**Zoom/Meeting Link**
- Label: "Zoom/Meeting Link"
- Placeholder: "https://zoom.us/j/..."
- Help text: "This link will be included in all calendar invitations"

**Meeting Description**
- Label: "Meeting Description (Optional)"
- Placeholder: "Looking forward to our discussion!"
- Help text: "Additional text to include in invitations"

### Schedule Configuration
**Business Hours Start**
- Label: "Start Time"
- Options: "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"

**Business Hours End**  
- Label: "End Time"
- Options: "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"

**Meeting Duration**
- Label: "Meeting Duration"
- Help text: "Default length for availability slots"
- Options: "15 minutes", "30 minutes", "45 minutes", "1 hour"

**Date Range**
- Label: "Default Date Range"
- Help text: "How many days to show by default"
- Options: "Next 3 business days", "Next 5 business days", "Next 7 days", "Next 2 weeks"

---

## Help Text & Tooltips

### Authentication Help
**Google Calendar Connection**
"FreeBusy needs read-only access to your calendar to check availability. Your calendar data never leaves your device."

**Permission Explanation**
"We only read when you're busy - never meeting details or attendees."

**Security Assurance**
"Your meeting content, attendees, and personal details remain completely private."

### Business Hours Help
**Time Zone Information**
"Set your preferred meeting hours. Only slots within these hours will be shown as available."

**Local Time Clarification**
"Times are shown in your local timezone."

### Meeting Links Help
**Link Purpose**
"This link will be included in every calendar invitation. Typically your Zoom, Teams, or Google Meet link."

**Additional Content**
"You can include additional text like dial-in numbers."

### System Tray Help
**Tray Functionality**
"FreeBusy can run in the system tray for quick access. Right-click the icon for options."

**Quick Generate Explanation**
"Quick Generate creates availability for the next 3 business days and copies to clipboard."

### Auto-Copy Feature
**Behavior Description**
"Automatically copy results to clipboard when generation completes."

**Disable Option**
"Disable this if you prefer to copy manually."

---

## Error Messages

### Authentication Errors
**Expired Connection**
"Google Calendar connection expired. Please reconnect to continue."

**Connection Failure**
"Unable to connect to Google Calendar. Check your internet connection and try again."

**Permission Denied**
"Calendar access denied. FreeBusy needs calendar permissions to work."

**Authentication Failed**
"Authentication failed. Please close FreeBusy and try again."

**Token Refresh Failed**
"Unable to refresh calendar access. Please reconnect your Google account."

### Network Errors
**No Internet**
"No internet connection detected. Please check your connection and retry."

**Service Unavailable**
"Google Calendar is temporarily unavailable. Please try again in a few minutes."

**Request Timeout**
"Request timed out. This may be due to a slow connection."

**API Rate Limited**
"Calendar service is temporarily busy. Please try again in a few minutes."

### Configuration Errors
**Missing Business Hours**
"Please set your business hours before generating availability."

**Invalid Email**
"Invalid email address. Please enter a valid email."

**Invalid Meeting Link**
"Meeting link appears invalid. Please check the URL."

**Business Hours Logic Error**
"Business hours end time must be after start time."

**Empty Required Field**
"This field is required."

### Calendar Errors
**Calendar Access**
"Unable to read calendar data. Please check your Google Calendar permissions."

**No Calendar Found**
"No calendar found. Please ensure you have a Google Calendar set up."

**Calendar Temporarily Inaccessible**
"Calendar is temporarily inaccessible. Please try again later."

**Insufficient Permissions**
"FreeBusy doesn't have sufficient permissions to access your calendar."

### System Errors
**Application Error**
"An unexpected error occurred. Please try again."

**File System Error**
"Unable to save settings. Please check file permissions."

**Memory Error**
"Insufficient system resources. Please close other applications and try again."

---

## Success Messages

### Action Confirmations
**Availability Generated**
"Availability copied to clipboard! Ready to paste into your email."

**Settings Saved**
"Settings saved successfully."

**Google Connected**
"Google Calendar connected successfully."

**Setup Complete**
"FreeBusy is now ready to use."

**Credentials Updated**
"Calendar connection refreshed successfully."

### Status Updates
**Calendar Check Progress**
"Checking calendar... This usually takes a few seconds."

**Analysis Results**
"Found X busy periods across Y days."

**Generation Complete**
"Generated availability for [date range]."

**Copy Confirmation**
"Availability copied to clipboard!"

### Background Operations
**Auto-Update**
"FreeBusy updated to version X.X.X successfully."

**Offline Cache**
"Calendar data cached for offline access."

**Settings Export**
"Settings exported successfully."

---

## Onboarding Copy

### Welcome Screen
**Main Headline**
"Welcome to FreeBusy Calendar"

**Subtitle**
"Share Your Availability in Seconds, Not Minutes"

**Description Paragraph**
"FreeBusy transforms your Google Calendar into shareable availability tables. Perfect for scheduling meetings without the back-and-forth emails."

**Feature Benefits**
- • Connect your Google Calendar securely
- • Generate availability tables instantly  
- • One-click copying to clipboard
- • Professional booking links for clients

### Setup Step Messages
**Step 1 Header**
"Let's connect your Google Calendar"

**Step 1 Description**
"We'll need read-only access to check when you're busy. Your meeting details stay private."

**Step 2 Header**
"Tell us about yourself"

**Step 2 Description**
"These details will appear in your booking links and calendar invitations."

**Step 3 Header**
"Set your meeting preferences"

**Step 3 Description**
"When are you typically available for meetings?"

**Completion Header**
"You're all set!"

**Completion Description**
"FreeBusy is ready to streamline your scheduling. Try generating your first availability table."

---

## System Notifications

### Desktop Notifications (Toast Messages)
**Generation Complete**
"Meeting availability generated successfully"

**Copy Success**
"Availability copied to clipboard"

**Background Running**
"FreeBusy is running in the background"

**Authentication Warning**
"Calendar connection expires in 2 days"

**Update Available**
"FreeBusy update available - click to install"

**Connection Issues**
"Unable to connect to Google Calendar"

### Tray Tooltips
**Default State**
"FreeBusy Calendar - Click for options"

**Generating State**
"Generating calendar availability..."

**Success State**
"Availability ready - copied to clipboard"

**Error State**
"Unable to generate availability - click for options"

---

## Loading States & Progress Messages

### Generation Process
**Initial Connection**
"🔍 Connecting to Google Calendar..."

**Data Fetching**
"📅 Fetching your availability..."

**Analysis Phase**
"⚙️ Analyzing your calendar..."

**Table Generation**
"📋 Creating availability table..."

**Clipboard Copy**
"📋 Copying to clipboard..."

### Progress Descriptions
**Authentication Progress**
"Authenticating with Google..."

**Calendar Query Progress**
"Checking calendar for [date range]..."

**Data Processing Progress**
"Processing X busy periods..."

**Format Generation Progress**
"Generating shareable table..."

### Completion States
**Generation Success**
"✅ Availability Generated"

**Copy Success**  
"✅ Copied to Clipboard"

**Connection Success**
"✅ Connected Successfully"

**Save Success**
"✅ Settings Saved"

---

## Accessibility Labels (ARIA/Screen Reader)

### Button Descriptions
**Generate Button**
"Generate availability table for next 3 business days"

**Copy Button**
"Copy availability table to clipboard"

**Settings Button**
"Open application settings"

**Close Button**
"Close settings panel"

### Status Announcements
**Generation Started**
"Started generating calendar availability"

**Generation Complete**
"Calendar availability generation complete"

**Copy Success**
"Availability table copied to clipboard"

**Error Occurred**
"Error occurred during calendar access"

### Form Labels
**Email Input**
"Email address for calendar invitations"

**Meeting Title Input**
"Template for meeting titles"

**Zoom Link Input**
"Meeting link for calendar invitations"

**Business Hours Start**
"Business day start time"

**Business Hours End**
"Business day end time"

---

## Contextual Help Content

### First-Time User Guidance
**What This App Does**
"FreeBusy automatically checks your Google Calendar and creates tables showing when you're available for meetings. Share these tables with clients or colleagues to streamline scheduling."

**Why Connect Google Calendar**
"By connecting your Google Calendar, FreeBusy can see when you're busy without accessing any meeting details, attendees, or private information."

**How to Use Results**
"Copy the generated availability table and paste it directly into emails. Recipients can click booking links to schedule meetings instantly."

### Power User Tips
**System Tray Usage**
"Right-click the FreeBusy tray icon for quick access. 'Quick Generate' creates availability and copies to clipboard without opening the main window."

**Keyboard Shortcuts**
"Press Ctrl+Shift+G from anywhere to generate availability quickly."

**Customization Options**
"Adjust business hours, meeting duration, and default date ranges in Settings to match your preferences."

### Troubleshooting Guidance
**If Generation Fails**
"Check your internet connection and ensure you're still signed in to Google. Click 'Reconnect' in Settings if needed."

**If Copy Doesn't Work**
"Some applications require special paste permissions. Try pasting with Ctrl+V or right-click → Paste."

**If Links Don't Work**
"Ensure your Zoom/meeting link is complete and valid. Test it in a browser to verify it works."

---

## Legal & Privacy Text

### Privacy Assurances
**Data Access Statement**
"FreeBusy only accesses when you're busy, never meeting details, attendees, locations, or content."

**Data Storage Statement**
"No calendar data is stored on external servers. All processing happens locally on your device."

**Permission Explanation**
"The 'Read calendar availability' permission allows FreeBusy to see busy/free times only."

### Terms & Conditions Summary
**Usage Rights**
"FreeBusy is provided for personal and business scheduling use."

**Data Responsibility**
"Users are responsible for accuracy of shared availability information."

**Service Availability**
"FreeBusy depends on Google Calendar API availability and your internet connection."

---

## Version & About Information

### About Dialog Content
**Application Description**
"FreeBusy Calendar simplifies meeting scheduling by automatically generating shareable availability tables from your Google Calendar."

**Version Information**
"Version 1.0.0 - Built with Electron for cross-platform compatibility"

**Developer Information**
"Created to streamline professional scheduling workflows"

**Support Information**
"For support, visit [support website] or email [support email]"

### Update Notifications
**Update Available**
"FreeBusy version X.X.X is available with improvements and bug fixes."

**Update Description**
"This update includes enhanced calendar sync and improved error handling."

**Update Action**
"Update now to get the latest features and improvements."

---

This comprehensive text content document provides all the copy needed for implementing the FreeBusy Calendar application. Each message is designed to be clear, helpful, and consistent with the professional tone appropriate for business users while remaining accessible to non-technical audiences.