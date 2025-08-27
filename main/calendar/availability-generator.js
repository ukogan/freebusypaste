const { google } = require('googleapis');

class AvailabilityGenerator {
  constructor(authManager) {
    this.authManager = authManager;
  }
  
  async generate(options = {}) {
    try {
      // Get authenticated client
      const authClient = await this.authManager.getAuthenticatedClient();
      const calendar = google.calendar({ version: 'v3', auth: authClient });
      
      // Get user settings or use defaults
      const settings = {
        businessHoursStart: options.businessHoursStart || 9,
        businessHoursEnd: options.businessHoursEnd || 17,
        meetingDurationMinutes: options.meetingDurationMinutes || 30,
        dateRangeDays: options.dateRangeDays || 3,
        includeWeekends: options.includeWeekends || { saturday: false, sunday: false },
        email: options.email || '',
        meetingTitle: options.meetingTitle || 'Meeting',
        zoomLink: options.zoomLink || '',
        timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // Calculate date range
      const dateRange = this.calculateDateRange(settings.dateRangeDays, settings.includeWeekends);
      
      // Query calendar for busy times
      const busyTimes = await this.getBusyTimes(calendar, dateRange, settings.timezone);
      
      // Generate availability slots
      const availability = this.generateAvailabilitySlots(
        dateRange,
        busyTimes,
        settings
      );
      
      // Format result
      const result = {
        generationId: this.generateId(),
        timestamp: new Date().toISOString(),
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        },
        businessHours: {
          start: this.formatTime(settings.businessHoursStart),
          end: this.formatTime(settings.businessHoursEnd),
          timezone: settings.timezone
        },
        availability: availability,
        meetingDetails: {
          title: settings.meetingTitle,
          zoomLink: settings.zoomLink,
          attendeeEmail: settings.email,
          duration: settings.meetingDurationMinutes
        },
        formats: {
          markdown: this.formatAsMarkdown(availability, settings),
          html: this.formatAsHTML(availability, settings),
          plain: this.formatAsPlainText(availability, settings)
        }
      };
      
      return result;
      
    } catch (error) {
      console.error('Availability generation failed:', error);
      throw new Error(`Failed to generate availability: ${error.message}`);
    }
  }
  
  calculateDateRange(days, includeWeekends) {
    const start = new Date();
    start.setDate(start.getDate() + 1); // Start from tomorrow
    start.setHours(0, 0, 0, 0);
    
    const dates = [];
    let currentDate = new Date(start);
    
    while (dates.length < days) {
      const dayOfWeek = currentDate.getDay();
      
      // Include weekends based on settings
      const isSaturday = dayOfWeek === 6;
      const isSunday = dayOfWeek === 0;
      
      if ((!isSaturday && !isSunday) || 
          (isSaturday && includeWeekends.saturday) ||
          (isSunday && includeWeekends.sunday)) {
        dates.push(new Date(currentDate));
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      start: dates[0],
      end: dates[dates.length - 1],
      dates: dates
    };
  }
  
  async getBusyTimes(calendar, dateRange, timezone) {
    try {
      const timeMin = dateRange.start.toISOString();
      const timeMax = new Date(dateRange.end);
      timeMax.setDate(timeMax.getDate() + 1);
      const timeMaxISO = timeMax.toISOString();
      
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin,
          timeMax: timeMaxISO,
          timeZone: timezone,
          items: [{ id: 'primary' }]
        }
      });
      
      const busyTimes = response.data.calendars?.primary?.busy || [];
      
      return busyTimes.map(busy => ({
        start: new Date(busy.start),
        end: new Date(busy.end)
      }));
      
    } catch (error) {
      console.error('Failed to fetch busy times:', error);
      throw new Error(`Calendar query failed: ${error.message}`);
    }
  }
  
  generateAvailabilitySlots(dateRange, busyTimes, settings) {
    const availability = [];
    
    for (const date of dateRange.dates) {
      const dayAvailability = {
        date: date.toISOString().split('T')[0],
        dateFormatted: this.formatDate(date),
        slots: []
      };
      
      // Generate time slots for this day
      const startHour = settings.businessHoursStart;
      const endHour = settings.businessHoursEnd;
      const slotDurationMinutes = settings.meetingDurationMinutes;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDurationMinutes) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMinutes);
          
          // Check if slot conflicts with busy times
          const isAvailable = !this.isSlotBusy(slotStart, slotEnd, busyTimes);
          
          dayAvailability.slots.push({
            time: this.formatTime(hour, minute),
            timeFormatted: this.formatTimeForDisplay(hour, minute),
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: isAvailable,
            reason: isAvailable ? null : 'busy'
          });
        }
      }
      
      availability.push(dayAvailability);
    }
    
    return availability;
  }
  
  isSlotBusy(slotStart, slotEnd, busyTimes) {
    return busyTimes.some(busy => {
      return slotStart < busy.end && slotEnd > busy.start;
    });
  }
  
  formatAsMarkdown(availability, settings) {
    let markdown = `# Meeting Availability\n\n`;
    
    // Meeting details
    markdown += `**Meeting:** ${settings.meetingTitle}  \n`;
    if (settings.zoomLink) {
      markdown += `**Zoom:** ${settings.zoomLink}  \n`;
    }
    if (settings.email) {
      markdown += `**Attendee:** ${settings.email}  \n`;
    }
    markdown += `\n`;
    
    // Create table
    const dates = availability.map(day => day.dateFormatted);
    markdown += `| Time |`;
    dates.forEach(date => {
      markdown += ` ${date} |`;
    });
    markdown += `\n`;
    
    // Table separator
    markdown += `|------|`;
    dates.forEach(() => {
      markdown += `----------|`;
    });
    markdown += `\n`;
    
    // Get all unique times and sort them chronologically
    const allTimes = [...new Set(availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort((a, b) => {
      // Convert to 24-hour format for proper sorting
      const timeA = this.parseTimeForSort(a);
      const timeB = this.parseTimeForSort(b);
      return timeA - timeB;
    });
    
    // Create rows
    allTimes.forEach(time => {
      markdown += `| **${time}** |`;
      availability.forEach(day => {
        const slot = day.slots.find(s => s.timeFormatted === time);
        if (slot && slot.available) {
          const link = this.createCalendarLink(slot, settings);
          markdown += ` [book](${link}) |`;
        } else {
          markdown += ` — |`;
        }
      });
      markdown += `\n`;
    });
    
    return markdown;
  }
  
  formatAsHTML(availability, settings) {
    let html = `<div class="freebusy-availability">\n`;
    html += `  <div class="meeting-details">\n`;
    html += `    <h3>Meeting Availability</h3>\n`;
    html += `    <p><strong>Meeting:</strong> ${settings.meetingTitle}</p>\n`;
    if (settings.zoomLink) {
      html += `    <p><strong>Zoom:</strong> <a href="${settings.zoomLink}">Join Meeting</a></p>\n`;
    }
    if (settings.email) {
      html += `    <p><strong>Attendee:</strong> ${settings.email}</p>\n`;
    }
    html += `  </div>\n\n`;
    
    html += `  <table class="availability-table">\n`;
    html += `    <thead>\n      <tr>\n        <th>Time</th>\n`;
    availability.forEach(day => {
      html += `        <th><strong>${day.dateFormatted}</strong></th>\n`;
    });
    html += `      </tr>\n    </thead>\n    <tbody>\n`;
    
    // Get all unique times and sort them chronologically
    const allTimes = [...new Set(availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort((a, b) => {
      // Convert to 24-hour format for proper sorting
      const timeA = this.parseTimeForSort(a);
      const timeB = this.parseTimeForSort(b);
      return timeA - timeB;
    });
    
    // Create rows
    allTimes.forEach(time => {
      html += `      <tr>\n        <td><strong>${time}</strong></td>\n`;
      availability.forEach(day => {
        const slot = day.slots.find(s => s.timeFormatted === time);
        if (slot && slot.available) {
          const link = this.createCalendarLink(slot, settings);
          html += `        <td><a href="${link}" style="color: #007AFF; text-decoration: none; font-weight: bold;">book</a></td>\n`;
        } else {
          html += `        <td><span class="unavailable">—</span></td>\n`;
        }
      });
      html += `      </tr>\n`;
    });
    
    html += `    </tbody>\n  </table>\n</div>`;
    
    return html;
  }
  
  formatAsPlainText(availability, settings) {
    let text = `Meeting Availability\n\n`;
    
    text += `Meeting: ${settings.meetingTitle}\n`;
    if (settings.zoomLink) {
      text += `Zoom: ${settings.zoomLink}\n`;
    }
    if (settings.email) {
      text += `Attendee: ${settings.email}\n`;
    }
    text += `\n`;
    
    availability.forEach(day => {
      text += `${day.dateFormatted}:\n`;
      day.slots.forEach(slot => {
        if (slot.available) {
          text += `  ${slot.timeFormatted} - AVAILABLE\n`;
        }
      });
      text += `\n`;
    });
    
    return text;
  }
  
  formatTime(hour, minute = 0) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  parseTimeForSort(timeStr) {
    // Convert "10 AM" or "2:30 PM" to 24-hour format for sorting
    const [time, period] = timeStr.split(' ');
    const [hour, minute = 0] = time.split(':').map(Number);
    let hour24 = hour;
    
    if (period === 'PM' && hour !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minute; // Return total minutes for sorting
  }

  createCalendarLink(slot, settings) {
    // Parse the time formatted display to get local hour/minute
    const [time, period] = slot.timeFormatted.split(' ');
    const [hourStr, minuteStr = '0'] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    // Create date in user's timezone
    const slotDate = new Date(slot.start);
    const startTime = new Date(slotDate);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + settings.meetingDurationMinutes);
    
    // Format for Google Calendar (in user's local timezone)
    const formatForCalendar = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };
    
    const startStr = formatForCalendar(startTime);
    const endStr = formatForCalendar(endTime);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: settings.meetingTitle,
      dates: `${startStr}/${endStr}`,
      details: settings.zoomLink ? `Zoom: ${settings.zoomLink}` : '',
      add: settings.email || ''
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
  
  formatTimeForDisplay(hour, minute = 0) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
    return `${displayHour}${displayMinute} ${period}`;
  }
  
  formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    return `${dayName} ${month} ${day}`;
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = AvailabilityGenerator;