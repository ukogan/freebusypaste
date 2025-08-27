# FreeBusy Desktop - Data Schema Documentation

## Overview

This document defines all data structures, storage mechanisms, and API interfaces used in FreeBusy Desktop. The application prioritizes user privacy by storing minimal data and maintaining read-only access to calendar information.

## Application Configuration Schema

### User Settings (`user-settings.json`)
```json
{
  "version": "1.0.0",
  "personal": {
    "email": "string",
    "meetingTitle": "string", 
    "zoomLink": "string",
    "meetingDescription": "string"
  },
  "schedule": {
    "businessHoursStart": 9,
    "businessHoursEnd": 17,
    "meetingDurationMinutes": 30,
    "defaultDateRangeDays": 3,
    "includeWeekends": {
      "saturday": false,
      "sunday": false
    },
    "timezone": "string"
  },
  "behavior": {
    "autoCopyToClipboard": true,
    "minimizeAfterCopy": true,
    "showDesktopNotifications": true,
    "startWithSystem": false,
    "calendarRefreshIntervalMinutes": 15,
    "cacheCalendarData": true
  },
  "window": {
    "position": {
      "x": 100,
      "y": 100
    },
    "size": {
      "width": 720,
      "height": 480
    },
    "minimizeToTray": true
  },
  "lastModified": "2025-08-27T10:30:00.000Z"
}
```

### Authentication Tokens (macOS Keychain)
```json
{
  "service": "freebusy-desktop",
  "account": "google-oauth",
  "data": {
    "accessToken": "encrypted_string",
    "refreshToken": "encrypted_string", 
    "tokenType": "Bearer",
    "expiryDate": "2025-08-27T11:30:00.000Z",
    "scope": "https://www.googleapis.com/auth/calendar.readonly"
  }
}
```

## Google Calendar API Data Structures

### Calendar List Response
```json
{
  "kind": "calendar#calendarList",
  "items": [
    {
      "id": "string",
      "summary": "string",
      "primary": boolean,
      "selected": boolean,
      "accessRole": "string",
      "timeZone": "string"
    }
  ]
}
```

### Freebusy Query Request
```json
{
  "timeMin": "2025-08-27T09:00:00.000Z",
  "timeMax": "2025-08-29T18:00:00.000Z", 
  "timeZone": "America/New_York",
  "items": [
    {
      "id": "primary"
    }
  ]
}
```

### Freebusy Query Response
```json
{
  "kind": "calendar#freeBusy",
  "timeMin": "2025-08-27T09:00:00.000Z",
  "timeMax": "2025-08-29T18:00:00.000Z",
  "calendars": {
    "primary": {
      "busy": [
        {
          "start": "2025-08-27T10:00:00.000Z",
          "end": "2025-08-27T11:00:00.000Z"
        },
        {
          "start": "2025-08-28T14:00:00.000Z", 
          "end": "2025-08-28T14:30:00.000Z"
        }
      ]
    }
  }
}
```

## Application Runtime Data

### Generated Availability Data
```json
{
  "generationId": "uuid",
  "timestamp": "2025-08-27T10:30:00.000Z",
  "dateRange": {
    "start": "2025-08-27",
    "end": "2025-08-29"
  },
  "businessHours": {
    "start": "09:00",
    "end": "17:00",
    "timezone": "America/New_York"
  },
  "availability": [
    {
      "date": "2025-08-27",
      "slots": [
        {
          "time": "09:00",
          "available": true,
          "bookingLink": "string"
        },
        {
          "time": "09:30", 
          "available": true,
          "bookingLink": "string"
        },
        {
          "time": "10:00",
          "available": false,
          "reason": "busy"
        }
      ]
    }
  ],
  "meetingDetails": {
    "title": "Meeting with Uri",
    "zoomLink": "https://rzero.zoom.us/j/5152335657",
    "attendeeEmail": "ukogan@rzero.com",
    "description": "Looking forward to our discussion!"
  }
}
```

### Cache Storage (`availability-cache.json`)
```json
{
  "version": "1.0.0",
  "lastUpdate": "2025-08-27T10:30:00.000Z",
  "cacheExpiry": "2025-08-27T11:00:00.000Z",
  "data": {
    "currentGeneration": "GeneratedAvailabilityData",
    "previousGenerations": [
      "GeneratedAvailabilityData"
    ]
  },
  "calendarData": {
    "lastFetch": "2025-08-27T10:25:00.000Z",
    "busyTimes": [
      {
        "start": "2025-08-27T10:00:00.000Z",
        "end": "2025-08-27T11:00:00.000Z"
      }
    ]
  }
}
```

## Export Data Formats

### Markdown Export
```markdown
# Meeting Availability - Aug 27-29, 2025

**Meeting:** Meeting with Uri  
**Zoom:** https://rzero.zoom.us/j/5152335657  
**Attendee:** ukogan@rzero.com

| Time | Wed 8/27 | Thu 8/28 | Fri 8/29 |
|------|----------|----------|----------|
| 9:00 | [BOOK](link) | [BOOK](link) | [BOOK](link) |
| 9:30 | [BOOK](link) | — | [BOOK](link) |
| 10:00 | — | [BOOK](link) | [BOOK](link) |
```

### HTML Export Structure
```html
<div class="freebusy-availability">
  <div class="meeting-details">
    <h3>Meeting Availability</h3>
    <p><strong>Meeting:</strong> Meeting with Uri</p>
    <p><strong>Zoom:</strong> <a href="zoom-link">Join Meeting</a></p>
    <p><strong>Attendee:</strong> ukogan@rzero.com</p>
  </div>
  
  <table class="availability-table">
    <thead>
      <tr>
        <th>Time</th>
        <th>Wed 8/27</th>
        <th>Thu 8/28</th>
        <th>Fri 8/29</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>9:00</td>
        <td><a href="booking-link" class="book-button">BOOK</a></td>
        <td><a href="booking-link" class="book-button">BOOK</a></td>
        <td><a href="booking-link" class="book-button">BOOK</a></td>
      </tr>
    </tbody>
  </table>
</div>
```

### CSV Export Structure
```csv
Time,Wed 8/27,Thu 8/28,Fri 8/29
9:00,AVAILABLE,AVAILABLE,AVAILABLE
9:30,AVAILABLE,BUSY,AVAILABLE
10:00,BUSY,AVAILABLE,AVAILABLE
10:30,AVAILABLE,AVAILABLE,BUSY
```

## Application State Management

### Main Process State
```json
{
  "authentication": {
    "isAuthenticated": boolean,
    "tokenExpiry": "timestamp",
    "connectedEmail": "string"
  },
  "generation": {
    "isGenerating": boolean,
    "lastGenerationTime": "timestamp",
    "error": "string | null"
  },
  "ui": {
    "windowVisible": boolean,
    "settingsOpen": boolean,
    "currentTab": "string"
  },
  "systemTray": {
    "lastQuickGeneration": "timestamp",
    "notificationShown": boolean
  }
}
```

### Renderer Process State
```json
{
  "ui": {
    "loading": boolean,
    "error": "string | null",
    "currentView": "generation | results | settings | onboarding",
    "formData": "object"
  },
  "availability": {
    "currentData": "GeneratedAvailabilityData | null",
    "displayFormat": "table | list",
    "copied": boolean
  },
  "settings": {
    "activeTab": "account | personal | schedule | advanced",
    "unsavedChanges": boolean,
    "validationErrors": "object"
  }
}
```

## Database Schema (Future: SQLite for Multi-Account)

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Availability_Cache Table  
```sql
CREATE TABLE availability_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  generation_id TEXT UNIQUE NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  availability_data TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### User_Settings Table
```sql
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL, -- JSON
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (user_id, setting_key)
);
```

## Data Validation Rules

### Input Validation
- **Email**: RFC 5322 compliant email format
- **Zoom Link**: Valid URL format, optional HTTPS requirement
- **Business Hours**: Start time must be before end time, both in 24-hour format
- **Date Range**: 1-30 days maximum, future dates only
- **Meeting Duration**: 15, 30, 45, or 60 minutes only

### Data Integrity
- **Token Expiry**: Automatic refresh 5 minutes before expiration
- **Cache Expiry**: Maximum 1 hour cache lifetime
- **Configuration**: JSON schema validation on all settings
- **Calendar Data**: Timezone consistency validation

## Privacy and Security Considerations

### Data Minimization
- No meeting content, titles, or attendee information stored
- Only busy/free time blocks cached
- User settings stored locally only
- No data transmitted to third-party services

### Encryption Standards
- macOS Keychain for OAuth tokens (built-in encryption)
- AES-256-GCM for sensitive configuration data
- HTTPS only for all API communications
- Certificate pinning for Google API endpoints

### Data Retention
- Availability cache: 24 hours maximum
- User settings: Persistent until user deletion
- Authentication tokens: Automatic cleanup on logout
- Application logs: 7 days maximum, no sensitive data

## API Rate Limiting

### Google Calendar API Limits
- Freebusy queries: 1,000 requests/day per user
- Calendar list: 100 requests/day per user
- Request batching to minimize API calls
- Exponential backoff for rate limit errors

### Application Rate Limiting
- Maximum 1 generation request per 30 seconds
- Quick generation cooldown: 10 seconds
- Automatic queuing for rapid requests
- User notification for rate limit delays