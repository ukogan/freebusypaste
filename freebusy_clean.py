#!/usr/bin/env python3
"""
Google Calendar Meeting Availability Generator
Automatically fetches your calendar and generates a meeting availability table
"""

import os
import datetime
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
CREDENTIALS_FILE = 'credentials.json'  # Download from Google Cloud Console
TOKEN_FILE = 'token.json'

# Your settings - modify these
YOUR_EMAIL = 'ukogan@rzero.com'
ZOOM_LINK = 'https://rzero.zoom.us/j/5152335657?pwd=y2I05VaZqdo6tx4oIjjPGE5Or21Dbw.1&omn=83877865848'
BUSINESS_HOURS_START = 9  # 9 AM
BUSINESS_HOURS_END = 18   # 6 PM
MIN_MEETING_DURATION = 30  # minutes

def authenticate_google_calendar():
    """Authenticate and return Google Calendar service"""
    creds = None
    
    # Load existing token
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    # If no valid credentials, run OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print(f"""
ERROR: {CREDENTIALS_FILE} not found!

To set up Google Calendar API access:

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Download the JSON file and save it as '{CREDENTIALS_FILE}'
6. Run this script again

For detailed instructions: https://developers.google.com/calendar/api/quickstart/python
""")
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save credentials for next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    
    return build('calendar', 'v3', credentials=creds)

def get_next_working_days(num_days=3):
    """Get next N working days (skip weekends)"""
    working_days = []
    current_date = datetime.date.today()
    
    while len(working_days) < num_days:
        # Skip weekends (Monday=0, Sunday=6)
        if current_date.weekday() < 5:  # Monday-Friday
            working_days.append(current_date)
        current_date += datetime.timedelta(days=1)
    
    return working_days

def get_busy_times(service, calendar_id='primary', days=None):
    """Get busy times from Google Calendar"""
    if not days:
        days = get_next_working_days()
    
    # Create time range for freebusy query
    time_min = datetime.datetime.combine(days[0], datetime.time(0, 0))
    time_max = datetime.datetime.combine(days[-1], datetime.time(23, 59))
    
    # Convert to RFC3339 format with timezone
    time_min_str = time_min.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'
    time_max_str = time_max.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'
    
    try:
        # Query for busy times
        freebusy_request = {
            'timeMin': time_min_str,
            'timeMax': time_max_str,
            'items': [{'id': calendar_id}]
        }
        
        result = service.freebusy().query(body=freebusy_request).execute()
        busy_times = result.get('calendars', {}).get(calendar_id, {}).get('busy', [])
        
        return busy_times
    except HttpError as error:
        print(f'An error occurred: {error}')
        return []

def find_free_slots(busy_times, working_days):
    """Find free time slots during business hours"""
    free_slots = {}
    
    for day in working_days:
        day_key = day.strftime('%Y-%m-%d')
        free_slots[day_key] = []
        
        # Create business hours for this day
        day_start = datetime.datetime.combine(day, datetime.time(BUSINESS_HOURS_START, 0))
        day_end = datetime.datetime.combine(day, datetime.time(BUSINESS_HOURS_END, 0))
        
        # Convert busy times to datetime objects for this day
        day_busy_times = []
        for busy in busy_times:
            busy_start = datetime.datetime.fromisoformat(busy['start'].replace('Z', '+00:00')).replace(tzinfo=None)
            busy_end = datetime.datetime.fromisoformat(busy['end'].replace('Z', '+00:00')).replace(tzinfo=None)
            
            # Only include busy times that overlap with this day and business hours
            if (busy_start.date() == day or busy_end.date() == day) and \
               (busy_start < day_end and busy_end > day_start):
                day_busy_times.append((max(busy_start, day_start), min(busy_end, day_end)))
        
        # Sort busy times
        day_busy_times.sort(key=lambda x: x[0])
        
        # Find free slots
        current_time = day_start
        
        for busy_start, busy_end in day_busy_times:
            # Free time before this busy period
            if current_time < busy_start:
                duration = (busy_start - current_time).total_seconds() / 60
                if duration >= MIN_MEETING_DURATION:
                    free_slots[day_key].append((current_time, busy_start))
            current_time = max(current_time, busy_end)
        
        # Free time after last busy period
        if current_time < day_end:
            duration = (day_end - current_time).total_seconds() / 60
            if duration >= MIN_MEETING_DURATION:
                free_slots[day_key].append((current_time, day_end))
    
    return free_slots

def create_calendar_link(start_time, end_time, email, zoom_link):
    """Create Google Calendar booking link"""
    # Format: YYYYMMDDTHHMMSSZ
    start_str = start_time.strftime('%Y%m%dT%H%M%SZ')
    end_str = end_time.strftime('%Y%m%dT%H%M%SZ')
    
    base_url = "https://calendar.google.com/calendar/render"
    params = {
        'action': 'TEMPLATE',
        'text': 'Meeting with Uri',
        'dates': f'{start_str}/{end_str}',
        'details': f'Zoom: {zoom_link}',
        'add': email
    }
    
    query_string = '&'.join([f'{k}={v.replace(" ", "%20").replace(":", "%3A").replace("/", "%2F").replace("?", "%3F").replace("=", "%3D").replace("&", "%26")}' for k, v in params.items()])
    return f'{base_url}?{query_string}'

def generate_30min_slots(free_slots):
    """Break free time into 30-minute slots"""
    time_slots = []
    
    # Generate all 30-minute slots from 9:00 to 17:30
    for hour in range(9, 18):
        for minute in [0, 30]:
            if hour == 17 and minute == 30:  # Don't go past 17:30
                break
            time_slots.append(f'{hour}:{minute:02d}')
    
    # Check which slots are available for each day
    availability = {}
    
    for day_key, day_free_times in free_slots.items():
        day_date = datetime.datetime.strptime(day_key, '%Y-%m-%d').date()
        availability[day_key] = {}
        
        for time_slot in time_slots:
            hour, minute = map(int, time_slot.split(':'))
            slot_start = datetime.datetime.combine(day_date, datetime.time(hour, minute))
            slot_end = slot_start + datetime.timedelta(minutes=30)
            
            # Check if this 30-min slot fits in any free time
            is_available = False
            for free_start, free_end in day_free_times:
                if slot_start >= free_start and slot_end <= free_end:
                    is_available = True
                    break
            
            availability[day_key][time_slot] = {
                'available': is_available,
                'start_time': slot_start,
                'end_time': slot_end
            }
    
    return availability, time_slots

def generate_markdown_table(availability, time_slots, working_days):
    """Generate the markdown table"""
    # Format day headers
    day_headers = []
    for day in working_days:
        day_str = day.strftime('%a %-m/%-d')  # e.g., "Wed 8/27"
        day_headers.append(day_str)
    
    # Start markdown table
    markdown = f"| Time | **{day_headers[0]}** | **{day_headers[1]}** | **{day_headers[2]}** |\n"
    markdown += "|:----:|:------------:|:------------:|:------------:|\n"
    
    # Generate rows
    for time_slot in time_slots:
        markdown += f"| **{time_slot}** |"
        
        for i, day in enumerate(working_days):
            day_key = day.strftime('%Y-%m-%d')
            slot_info = availability[day_key][time_slot]
            
            if slot_info['available']:
                link = create_calendar_link(
                    slot_info['start_time'], 
                    slot_info['end_time'], 
                    YOUR_EMAIL, 
                    ZOOM_LINK
                )
                markdown += f" [**BOOK**]({link}) |"
            else:
                markdown += " — |"
        
        markdown += "\n"
    
    markdown += "\n**Click any BOOK link to schedule that 30-minute slot.**"
    
    return markdown

def main():
    """Main function"""
    print("🔍 Connecting to Google Calendar...")
    
    # Authenticate
    service = authenticate_google_calendar()
    if not service:
        return
    
    print("📅 Fetching your availability...")
    
    # Get next 3 working days
    working_days = get_next_working_days(3)
    print(f"Checking availability for: {', '.join([d.strftime('%a %m/%d') for d in working_days])}")
    
    # Get busy times
    busy_times = get_busy_times(service, days=working_days)
    print(f"Found {len(busy_times)} busy periods")
    
    # Find free slots
    free_slots = find_free_slots(busy_times, working_days)
    
    # Generate 30-minute availability grid
    availability, time_slots = generate_30min_slots(free_slots)
    
    # Generate markdown table
    markdown_table = generate_markdown_table(availability, time_slots, working_days)
    
    # Output
    print("\n" + "="*60)
    print("📋 YOUR MEETING AVAILABILITY TABLE")
    print("="*60)
    print(markdown_table)
    print("="*60)
    
    # Save to file
    filename = f"meeting_availability_{datetime.date.today().strftime('%Y%m%d')}.md"
    with open(filename, 'w') as f:
        f.write(markdown_table)
    
    print(f"\n💾 Table saved to: {filename}")
    print("📧 Copy the table above and paste it into your email!")

if __name__ == "__main__":
    main()