# FreeBusy Desktop Roadmap

## 🎯 Current Status (v1.0.0)
**Status**: ✅ Production Ready  
**Released**: August 2025

### ✅ Completed Features
- [x] Google Calendar OAuth2 integration with guided setup
- [x] Interactive gradient button UI for meeting options
- [x] Real-time availability table generation
- [x] Email-ready HTML formatting with clipboard integration
- [x] Native macOS app with professional logo and icon
- [x] Universal builds (Intel + Apple Silicon)
- [x] In-app credential upload and validation
- [x] Comprehensive setup documentation
- [x] Demo mode for testing without credentials
- [x] Settings management with persistent storage
- [x] Menu bar integration and window management

---

## 🚀 Future Enhancements

### v1.1 - Polish & Refinement
**Priority**: High • **Timeline**: Q4 2025

- [ ] **Enhanced UX**
  - [ ] Loading animations and better progress indicators
  - [ ] Keyboard shortcuts for power users
  - [ ] Remember last used meeting options
  - [ ] Dark mode support

- [ ] **Improved Error Handling**
  - [ ] Better offline mode messaging
  - [ ] Retry mechanisms for failed API calls
  - [ ] More detailed troubleshooting guides

- [ ] **Performance Optimizations**
  - [ ] Faster calendar data caching
  - [ ] Reduced app startup time
  - [ ] Memory usage optimizations

### v1.2 - Extended Calendar Support
**Priority**: Medium • **Timeline**: Q1 2026

- [ ] **Multi-Calendar Support**
  - [ ] Select which calendars to include/exclude
  - [ ] Different availability rules per calendar
  - [ ] Visual calendar indicators in results

- [ ] **Advanced Time Options**
  - [ ] Custom meeting durations (beyond 15, 30, 45, 60)
  - [ ] Buffer time between meetings
  - [ ] Lunch break exclusions
  - [ ] Different business hours per day

### v1.3 - Collaboration Features
**Priority**: Medium • **Timeline**: Q2 2026

- [ ] **Team Features**
  - [ ] Find common availability across multiple team members
  - [ ] Export availability in multiple formats (CSV, PDF)
  - [ ] Share availability links (view-only web pages)

- [ ] **Advanced Formatting**
  - [ ] Customizable email templates
  - [ ] Timezone display options
  - [ ] Branded availability tables

### v2.0 - Platform Expansion
**Priority**: Low • **Timeline**: TBD

- [ ] **Cross-Platform Support**
  - [ ] Windows desktop application
  - [ ] Linux desktop application
  - [ ] Web-based version for mobile

- [ ] **Additional Calendar Providers**
  - [ ] Microsoft Outlook/Office 365 integration
  - [ ] Apple Calendar integration
  - [ ] Caldav support for other providers

---

## 🛠️ Technical Debt & Maintenance

### Ongoing
- [ ] Regular dependency updates
- [ ] Security audit and improvements
- [ ] Performance monitoring and optimization
- [ ] Test coverage improvements

### Code Quality
- [ ] Refactor authentication flow for better modularity
- [ ] Improve error handling consistency
- [ ] Add comprehensive integration tests
- [ ] Document all APIs and internal modules

---

## 💡 Community Requests

*Features requested by users - add GitHub issue links as they come in*

### Under Consideration
- [ ] Calendar event creation directly from availability
- [ ] Integration with scheduling tools (Calendly, etc.)
- [ ] Recurring availability patterns
- [ ] Mobile companion app

### Declined/Deferred
- ~~Real-time collaboration~~ - Too complex for current scope
- ~~Cloud sync~~ - Privacy concerns, local-first approach preferred

---

## 🤝 Contributing

### How to Contribute
1. **Bug Reports**: Use [GitHub Issues](https://github.com/ukogan/freebusypaste/issues)
2. **Feature Requests**: Add to GitHub Issues with `enhancement` label
3. **Code Contributions**: 
   - Fork the repository
   - Create feature branch
   - Submit pull request with tests
   - Follow existing code style

### Development Setup
```bash
git clone https://github.com/ukogan/freebusypaste.git
cd freebusypaste
npm install
npm start  # Development mode
```

### Priorities for Contributors
- **High Impact**: UX improvements, performance optimizations
- **Medium Impact**: Additional calendar providers, advanced formatting
- **Low Impact**: Platform expansions, major new features

---

## 📊 Metrics & Success Criteria

### v1.1 Goals
- [ ] Reduce setup time from 5+ minutes to <2 minutes
- [ ] Achieve <100ms availability generation time
- [ ] 95%+ user setup success rate

### Long-term Vision
- **Mission**: Make calendar availability sharing effortless
- **Success**: Users prefer FreeBusy over manual calendar checking
- **Impact**: Save collective hours of calendar coordination time

---

*Last updated: August 2025*  
*This roadmap is subject to change based on user feedback and project priorities.*