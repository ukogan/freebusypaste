// Demo availability generator for testing without Google Calendar
class DemoAvailabilityGenerator {
  constructor(authManager) {
    this.authManager = authManager;
  }
  
  async generate(options = {}) {
    console.log('🎭 Demo mode: Generating fake availability data...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get user settings or use defaults
    const settings = {
      businessHoursStart: options.businessHoursStart || 9,
      businessHoursEnd: options.businessHoursEnd || 17,
      meetingDurationMinutes: options.meetingDurationMinutes || 30,
      dateRangeDays: options.dateRangeDays || 3,
      includeWeekends: options.includeWeekends || { saturday: false, sunday: false },
      email: options.email || 'demo@example.com',
      meetingTitle: options.meetingTitle || 'Meeting with Demo User',
      zoomLink: options.zoomLink || 'https://zoom.us/j/demo123456789',
      timezone: options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Generate fake availability data
    const availability = this.generateDemoAvailability(settings);
    
    const result = {
      generationId: this.generateId(),
      timestamp: new Date().toISOString(),
      dateRange: {
        start: availability.dateRange.start,
        end: availability.dateRange.end
      },
      businessHours: {
        start: this.formatTime(settings.businessHoursStart),
        end: this.formatTime(settings.businessHoursEnd),
        timezone: settings.timezone
      },
      availability: availability.slots,
      meetingDetails: {
        title: settings.meetingTitle,
        zoomLink: settings.zoomLink,
        attendeeEmail: settings.email,
        duration: settings.meetingDurationMinutes
      },
      formats: {
        markdown: this.formatAsMarkdown(availability.slots, settings),
        html: this.formatAsHTML(availability.slots, settings),
        plain: this.formatAsPlainText(availability.slots, settings)
      },
      demo: true // Flag to indicate this is demo data
    };
    
    return result;
  }
  
  generateDemoAvailability(settings) {
    const today = new Date();
    const dates = [];
    
    // Generate next few business days
    let currentDate = new Date(today);
    while (dates.length < settings.dateRangeDays) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (!isWeekend || 
          (dayOfWeek === 6 && settings.includeWeekends.saturday) ||
          (dayOfWeek === 0 && settings.includeWeekends.sunday)) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const availability = [];
    
    dates.forEach((date, dayIndex) => {
      const dayAvailability = {
        date: date.toISOString().split('T')[0],
        dateFormatted: this.formatDate(date),
        slots: []
      };
      
      // Generate time slots with some fake busy times
      const startHour = settings.businessHoursStart;
      const endHour = settings.businessHoursEnd;
      const slotDuration = settings.meetingDurationMinutes;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          // Create some fake busy slots for demo
          const isBusy = this.isDemoBusyTime(dayIndex, hour, minute);
          
          dayAvailability.slots.push({
            time: this.formatTime(hour, minute),
            timeFormatted: this.formatTimeForDisplay(hour, minute),
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute).toISOString(),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute + slotDuration).toISOString(),
            available: !isBusy,
            reason: isBusy ? 'busy' : null
          });
        }
      }
      
      availability.push(dayAvailability);
    });
    
    return {
      dateRange: {
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0]
      },
      slots: availability
    };
  }
  
  isDemoBusyTime(dayIndex, hour, minute) {
    // Create some fake busy times for a realistic demo
    const patterns = [
      // Day 0: Busy 10:00-11:00 and 14:00-15:00
      (d, h, m) => d === 0 && ((h === 10) || (h === 14)),
      // Day 1: Busy 9:30-10:00 and 15:30-16:30
      (d, h, m) => d === 1 && ((h === 9 && m >= 30) || (h === 15 && m >= 30) || h === 16),
      // Day 2: Busy 11:00-12:00
      (d, h, m) => d === 2 && h === 11
    ];
    
    return patterns.some(pattern => pattern(dayIndex, hour, minute));
  }
  
  formatAsMarkdown(availability, settings) {
    let markdown = `# Meeting Availability - DEMO DATA\n\n`;
    
    // Meeting details
    markdown += `**Meeting:** ${settings.meetingTitle}  \n`;
    if (settings.zoomLink) {
      markdown += `**Zoom:** ${settings.zoomLink}  \n`;
    }
    if (settings.email) {
      markdown += `**Attendee:** ${settings.email}  \n`;
    }
    markdown += `\n_⚠️ This is demo data for testing purposes_\n\n`;
    
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
    
    // Get all unique times
    const allTimes = [...new Set(availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort();
    
    // Create rows
    allTimes.forEach(time => {
      markdown += `| **${time}** |`;
      availability.forEach(day => {
        const slot = day.slots.find(s => s.timeFormatted === time);
        if (slot && slot.available) {
          markdown += ` AVAILABLE |`;
        } else {
          markdown += ` — |`;
        }
      });
      markdown += `\n`;
    });
    
    return markdown;
  }
  
  formatAsHTML(availability, settings) {
    let html = `<div class="freebusy-availability demo-mode">\n`;
    html += `  <div class="demo-notice" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 8px; border-radius: 4px; margin-bottom: 16px;">⚠️ Demo Mode - This is sample data</div>\n`;
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
    
    // Rest of HTML table generation (same as real version)
    html += `  <table class="availability-table">\n`;
    html += `    <thead>\n      <tr>\n        <th>Time</th>\n`;
    availability.forEach(day => {
      html += `        <th><strong>${day.dateFormatted}</strong></th>\n`;
    });
    html += `      </tr>\n    </thead>\n    <tbody>\n`;
    
    const allTimes = [...new Set(availability.flatMap(day => 
      day.slots.map(slot => slot.timeFormatted)
    ))].sort();
    
    allTimes.forEach(time => {
      html += `      <tr>\n        <td><strong>${time}</strong></td>\n`;
      availability.forEach(day => {
        const slot = day.slots.find(s => s.timeFormatted === time);
        if (slot && slot.available) {
          html += `        <td><span class="available">AVAILABLE</span></td>\n`;
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
    let text = `Meeting Availability - DEMO DATA\n\n`;
    
    text += `Meeting: ${settings.meetingTitle}\n`;
    if (settings.zoomLink) {
      text += `Zoom: ${settings.zoomLink}\n`;
    }
    if (settings.email) {
      text += `Attendee: ${settings.email}\n`;
    }
    text += `\n⚠️ This is demo data for testing purposes\n\n`;
    
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
    return 'demo-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = DemoAvailabilityGenerator;