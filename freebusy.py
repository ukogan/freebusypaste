<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2575.6">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 16.0px 'Helvetica Neue'; color: #f9f8f2; -webkit-text-stroke: #f9f8f2; background-color: #242423}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 16.0px 'Helvetica Neue'; color: #f9f8f2; -webkit-text-stroke: #f9f8f2; background-color: #242423; min-height: 18.0px}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1">#!/usr/bin/env python3</span></p>
<p class="p1"><span class="s1">"""</span></p>
<p class="p1"><span class="s1">Google Calendar Meeting Availability Generator</span></p>
<p class="p1"><span class="s1">Automatically fetches your calendar and generates a meeting availability table</span></p>
<p class="p1"><span class="s1">"""</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">import os</span></p>
<p class="p1"><span class="s1">import datetime</span></p>
<p class="p1"><span class="s1">import json</span></p>
<p class="p1"><span class="s1">from google.auth.transport.requests import Request</span></p>
<p class="p1"><span class="s1">from google.oauth2.credentials import Credentials</span></p>
<p class="p1"><span class="s1">from google_auth_oauthlib.flow import InstalledAppFlow</span></p>
<p class="p1"><span class="s1">from googleapiclient.discovery import build</span></p>
<p class="p1"><span class="s1">from googleapiclient.errors import HttpError</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"># Configuration</span></p>
<p class="p1"><span class="s1">SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']</span></p>
<p class="p1"><span class="s1">CREDENTIALS_FILE = 'credentials.json'<span class="Apple-converted-space">  </span># Download from Google Cloud Console</span></p>
<p class="p1"><span class="s1">TOKEN_FILE = 'token.json'</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"># Your settings - modify these</span></p>
<p class="p1"><span class="s1">YOUR_EMAIL = 'ukogan@rzero.com'</span></p>
<p class="p1"><span class="s1">ZOOM_LINK = 'https://rzero.zoom.us/j/5152335657?pwd=y2I05VaZqdo6tx4oIjjPGE5Or21Dbw.1&amp;omn=83877865848'</span></p>
<p class="p1"><span class="s1">BUSINESS_HOURS_START = 9<span class="Apple-converted-space">  </span># 9 AM</span></p>
<p class="p1"><span class="s1">BUSINESS_HOURS_END = 18 <span class="Apple-converted-space">  </span># 6 PM</span></p>
<p class="p1"><span class="s1">MIN_MEETING_DURATION = 30<span class="Apple-converted-space">  </span># minutes</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def authenticate_google_calendar():</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Authenticate and return Google Calendar service"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>creds = None</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Load existing token</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if os.path.exists(TOKEN_FILE):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># If no valid credentials, run OAuth flow</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if not creds or not creds.valid:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>if creds and creds.expired and creds.refresh_token:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>creds.refresh(Request())</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>else:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if not os.path.exists(CREDENTIALS_FILE):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>print(f"""</span></p>
<p class="p1"><span class="s1">ERROR: {CREDENTIALS_FILE} not found!</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">To set up Google Calendar API access:</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">1. Go to https://console.cloud.google.com/</span></p>
<p class="p1"><span class="s1">2. Create a new project or select existing one</span></p>
<p class="p1"><span class="s1">3. Enable Google Calendar API</span></p>
<p class="p1"><span class="s1">4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs</span></p>
<p class="p1"><span class="s1">5. Download the JSON file and save it as '{CREDENTIALS_FILE}'</span></p>
<p class="p1"><span class="s1">6. Run this script again</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">For detailed instructions: https://developers.google.com/calendar/api/quickstart/python</span></p>
<p class="p1"><span class="s1">""")</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>return None</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">                </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>creds = flow.run_local_server(port=0)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Save credentials for next run</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>with open(TOKEN_FILE, 'w') as token:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>token.write(creds.to_json())</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return build('calendar', 'v3', credentials=creds)</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def get_next_working_days(num_days=3):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Get next N working days (skip weekends)"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>working_days = []</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>current_date = datetime.date.today()</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>while len(working_days) &lt; num_days:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Skip weekends (Monday=0, Sunday=6)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>if current_date.weekday() &lt; 5:<span class="Apple-converted-space">  </span># Monday-Friday</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>working_days.append(current_date)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>current_date += datetime.timedelta(days=1)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return working_days</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def get_busy_times(service, calendar_id='primary', days=None):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Get busy times from Google Calendar"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if not days:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>days = get_next_working_days()</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Create time range for freebusy query</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>time_min = datetime.datetime.combine(days[0], datetime.time(0, 0))</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>time_max = datetime.datetime.combine(days[-1], datetime.time(23, 59))</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Convert to RFC3339 format with timezone</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>time_min_str = time_min.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>time_max_str = time_max.strftime('%Y-%m-%dT%H:%M:%S') + 'Z'</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>try:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Query for busy times</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>freebusy_request = {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>'timeMin': time_min_str,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>'timeMax': time_max_str,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>'items': [{'id': calendar_id}]</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>result = service.freebusy().query(body=freebusy_request).execute()</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>busy_times = result.get('calendars', {}).get(calendar_id, {}).get('busy', [])</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>return busy_times</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>except HttpError as error:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>print(f'An error occurred: {error}')</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>return []</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def find_free_slots(busy_times, working_days):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Find free time slots during business hours"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>free_slots = {}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for day in working_days:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_key = day.strftime('%Y-%m-%d')</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>free_slots[day_key] = []</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Create business hours for this day</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_start = datetime.datetime.combine(day, datetime.time(BUSINESS_HOURS_START, 0))</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_end = datetime.datetime.combine(day, datetime.time(BUSINESS_HOURS_END, 0))</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Convert busy times to datetime objects for this day</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_busy_times = []</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>for busy in busy_times:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>busy_start = datetime.datetime.fromisoformat(busy['start'].replace('Z', '+00:00')).replace(tzinfo=None)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>busy_end = datetime.datetime.fromisoformat(busy['end'].replace('Z', '+00:00')).replace(tzinfo=None)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">            </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span># Only include busy times that overlap with this day and business hours</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if (busy_start.date() == day or busy_end.date() == day) and \</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">               </span>(busy_start &lt; day_end and busy_end &gt; day_start):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>day_busy_times.append((max(busy_start, day_start), min(busy_end, day_end)))</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Sort busy times</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_busy_times.sort(key=lambda x: x[0])</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Find free slots</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>current_time = day_start</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>for busy_start, busy_end in day_busy_times:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span># Free time before this busy period</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if current_time &lt; busy_start:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>duration = (busy_start - current_time).total_seconds() / 60</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>if duration &gt;= MIN_MEETING_DURATION:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>free_slots[day_key].append((current_time, busy_start))</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>current_time = max(current_time, busy_end)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span># Free time after last busy period</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>if current_time &lt; day_end:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>duration = (day_end - current_time).total_seconds() / 60</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if duration &gt;= MIN_MEETING_DURATION:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>free_slots[day_key].append((current_time, day_end))</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return free_slots</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def create_calendar_link(start_time, end_time, email, zoom_link):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Create Google Calendar booking link"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Format: YYYYMMDDTHHMMSSZ</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>start_str = start_time.strftime('%Y%m%dT%H%M%SZ')</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>end_str = end_time.strftime('%Y%m%dT%H%M%SZ')</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>base_url = "https://calendar.google.com/calendar/render"</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>params = {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'action': 'TEMPLATE',</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'text': 'Meeting with Uri',</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'dates': f'{start_str}/{end_str}',</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'details': f'Zoom: {zoom_link}',</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>'add': email</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>query_string = '&amp;'.join([f'{k}={v.replace(" ", "%20").replace(":", "%3A").replace("/", "%2F").replace("?", "%3F").replace("=", "%3D").replace("&amp;", "%26")}' for k, v in params.items()])</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return f'{base_url}?{query_string}'</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def generate_30min_slots(free_slots):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Break free time into 30-minute slots"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>time_slots = []</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Generate all 30-minute slots from 9:00 to 17:30</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for hour in range(9, 18):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>for minute in [0, 30]:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if hour == 17 and minute == 30:<span class="Apple-converted-space">  </span># Don't go past 17:30</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>break</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>time_slots.append(f'{hour}:{minute:02d}')</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Check which slots are available for each day</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>availability = {}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for day_key, day_free_times in free_slots.items():</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_date = datetime.datetime.strptime(day_key, '%Y-%m-%d').date()</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>availability[day_key] = {}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>for time_slot in time_slots:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>hour, minute = map(int, time_slot.split(':'))</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>slot_start = datetime.datetime.combine(day_date, datetime.time(hour, minute))</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>slot_end = slot_start + datetime.timedelta(minutes=30)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">            </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span># Check if this 30-min slot fits in any free time</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>is_available = False</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>for free_start, free_end in day_free_times:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>if slot_start &gt;= free_start and slot_end &lt;= free_end:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>is_available = True</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>break</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">            </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>availability[day_key][time_slot] = {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>'available': is_available,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>'start_time': slot_start,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>'end_time': slot_end</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return availability, time_slots</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def generate_markdown_table(availability, time_slots, working_days):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Generate the markdown table"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Format day headers</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>day_headers = []</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for day in working_days:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_str = day.strftime('%a %-m/%-d')<span class="Apple-converted-space">  </span># e.g., "Wed 8/27"</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>day_headers.append(day_str)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Start markdown table</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>markdown = f"| Time | **{day_headers[0]}** | **{day_headers[1]}** | **{day_headers[2]}** |\n"</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>markdown += "|:----:|:------------:|:------------:|:------------:|\n"</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Generate rows</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for time_slot in time_slots:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>markdown += f"| **{time_slot}** |"</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>for i, day in enumerate(working_days):</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>day_key = day.strftime('%Y-%m-%d')</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>slot_info = availability[day_key][time_slot]</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">            </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>if slot_info['available']:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>link = create_calendar_link(</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>slot_info['start_time'],<span class="Apple-converted-space"> </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>slot_info['end_time'],<span class="Apple-converted-space"> </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>YOUR_EMAIL,<span class="Apple-converted-space"> </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                    </span>ZOOM_LINK</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>markdown += f" [**BOOK**]({link}) |"</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">            </span>else:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">                </span>markdown += " — |"</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>markdown += "\n"</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>markdown += "\n**Click any BOOK link to schedule that 30-minute slot.**"</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return markdown</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">def main():</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>"""Main function"""</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("🔍 Connecting to Google Calendar...")</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Authenticate</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>service = authenticate_google_calendar()</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if not service:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>return</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("📅 Fetching your availability...")</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Get next 3 working days</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>working_days = get_next_working_days(3)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print(f"Checking availability for: {', '.join([d.strftime('%a %m/%d') for d in working_days])}")</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Get busy times</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>busy_times = get_busy_times(service, days=working_days)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print(f"Found {len(busy_times)} busy periods")</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Find free slots</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>free_slots = find_free_slots(busy_times, working_days)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Generate 30-minute availability grid</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>availability, time_slots = generate_30min_slots(free_slots)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Generate markdown table</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>markdown_table = generate_markdown_table(availability, time_slots, working_days)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Output</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("\n" + "="*60)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("📋 YOUR MEETING AVAILABILITY TABLE")</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("="*60)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print(markdown_table)</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("="*60)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span># Save to file</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>filename = f"meeting_availability_{datetime.date.today().strftime('%Y%m%d')}.md"</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>with open(filename, 'w') as f:</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>f.write(markdown_table)</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span></span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print(f"\n💾 Table saved to: {filename}")</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>print("📧 Copy the table above and paste it into your email!")</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">if __name__ == "__main__":</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>main()</span></p>
</body>
</html>
