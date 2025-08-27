# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Calendar availability checker that generates meeting availability tables. The script fetches calendar data via Google Calendar API and creates a markdown table showing available 30-minute time slots across the next 3 business days with direct booking links.

## Architecture

**Single-File Application:**
- `freebusy.py` - Main Python script containing all functionality
- `client_secret_*.json` - Google OAuth2 credentials (downloaded from Google Cloud Console)
- `token.json` - Cached OAuth2 tokens (generated on first run)
- `meeting_availability_YYYYMMDD.md` - Output file with availability table (generated each run)

**Core Functions:**
- `authenticate_google_calendar()` - Handles Google OAuth2 flow and token management
- `get_next_working_days()` - Calculates next N business days (skips weekends)  
- `get_busy_times()` - Queries Google Calendar Freebusy API for occupied time slots
- `find_free_slots()` - Identifies available time periods during business hours (9 AM - 6 PM)
- `generate_30min_slots()` - Breaks free time into bookable 30-minute slots
- `create_calendar_link()` - Generates Google Calendar booking URLs with pre-filled details
- `generate_markdown_table()` - Creates the final availability table in markdown format

## Development Commands

**Setup:**
```bash
pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

**Run:**
```bash
python3 freebusy.py
```

**Prerequisites:**
1. Set up Google Calendar API credentials at https://console.cloud.google.com/
2. Download OAuth2 client secrets and save as `credentials.json` (the script expects this filename, not the Google-generated long filename)
3. Configure personal details in script constants: `YOUR_EMAIL`, `ZOOM_LINK`, business hours

## Configuration

**Key Constants (modify at top of freebusy.py):**
- `YOUR_EMAIL` - Email address to add to calendar invites
- `ZOOM_LINK` - Meeting URL to include in calendar events
- `BUSINESS_HOURS_START/END` - Available hours (default 9 AM - 6 PM)
- `MIN_MEETING_DURATION` - Minimum slot size in minutes (default 30)
- `CREDENTIALS_FILE` - OAuth2 credentials filename (default 'credentials.json')

**Google API Setup Required:**
- Google Cloud Console project with Calendar API enabled
- OAuth2 credentials configured for desktop application
- Downloaded client secrets JSON file renamed to `credentials.json`

## File Structure

The script generates:
- `token.json` - OAuth2 refresh tokens (cached after first auth)
- `meeting_availability_YYYYMMDD.md` - Daily availability table with booking links

## Data Flow

1. **Authentication**: OAuth2 flow with Google (uses local server on first run)
2. **Calendar Query**: Freebusy API call for next 3 business days
3. **Slot Generation**: 30-minute slots from 9:00-17:30 checked against busy times
4. **Link Creation**: Available slots get Google Calendar booking URLs
5. **Output**: Markdown table printed to console and saved to file

## Security Notes

- OAuth2 tokens are cached locally in `token.json`
- Client secrets contain sensitive OAuth2 credentials
- Generated calendar links include personal Zoom URLs and email addresses
- Script operates in read-only mode for calendar access (`calendar.readonly` scope)