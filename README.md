# FreeBusy Desktop

A macOS desktop app for instantly generating and sharing your calendar availability. Connect to Google Calendar, select your meeting preferences, and copy formatted availability tables to share via email or messaging.

## Features

- 🗓️ **Google Calendar Integration** - Securely connects to your calendar
- ⚡ **Instant Generation** - Creates availability tables in seconds
- 📧 **Email-Ready Format** - Copies HTML tables that paste perfectly into emails
- 🎛️ **Flexible Options** - Choose meeting length (15, 30, 45, 60 min) and date range (2-7 days)
- 🖥️ **Native macOS App** - Runs locally, your data stays private

## Installation

### Option 1: Download Release
1. Download the latest `FreeBusy Desktop.dmg` from releases
2. Open the DMG file
3. Drag "FreeBusy Desktop" to your Applications folder
4. First run: Right-click the app → "Open" (to bypass macOS security)

### Option 2: Build from Source
```bash
git clone https://github.com/yourname/freebusypaste.git
cd freebusypaste
npm install
npm run build:mac
```

## Setup: Google Calendar API

To use FreeBusy Desktop, you need to set up Google Calendar API access:

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select existing project
3. Name your project (e.g., "FreeBusy Personal")

### Step 2: Enable Calendar API
1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Calendar API"
3. Click on it and press **"Enable"**

### Step 3: Create Credentials
1. Go to **APIs & Services > Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - Choose **"External"** user type
   - Fill required fields (App name: "FreeBusy Desktop", User support email, Developer email)
   - Add your email to test users
   - Save and continue through all steps
4. Back in Credentials, create OAuth client ID:
   - Application type: **"Desktop application"**
   - Name: "FreeBusy Desktop"
   - Click **"Create"**

### Step 4: Download Credentials
1. Find your newly created OAuth 2.0 Client ID
2. Click the **download icon** (⬇️) next to it
3. This downloads a JSON file (e.g., `client_secret_123...json`)

### Step 5: Add Credentials to App

#### Method A: Upload in App (Recommended)
1. Open FreeBusy Desktop
2. When prompted for credentials, click **"Upload Credentials File"**
3. Select the JSON file you downloaded
4. The app will securely store your credentials

#### Method B: Manual File Placement
1. Rename the downloaded file to `credentials.json`
2. Place it in the app's directory:
   - **Built app**: Right-click FreeBusy Desktop.app → "Show Package Contents" → Contents → Resources → credentials.json
   - **Development**: Place in project root as `credentials.json`

## Usage

1. **Connect**: First run will prompt for Google authentication
2. **Customize**: Select meeting length and date range with the option buttons
3. **Generate**: Click "Find my availability" 
4. **Share**: Click "Copy to clipboard" and paste into your email

## Troubleshooting

### "Google hasn't verified this app"
This is normal for personal API projects:
1. Click **"Advanced"**
2. Click **"Go to FreeBusy Desktop (unsafe)"**
3. Click **"Continue"**
4. Grant calendar permissions

### "No availability found"
- Check your business hours in Settings
- Ensure you have free time in the selected date range
- Verify calendar permissions were granted

### App won't start / API errors
- Ensure `credentials.json` is properly placed
- Check Google Cloud Console that Calendar API is enabled
- Verify OAuth consent screen is configured

## Settings

Access via the gear icon (⚙️) in the top right:

- **Personal**: Email, meeting title, Zoom link
- **Schedule**: Business hours, default preferences  
- **Advanced**: Auto-copy, minimize behavior, notifications

## Privacy & Security

- ✅ **Runs locally** - No data sent to external servers
- ✅ **Read-only access** - Only reads your calendar, never modifies
- ✅ **Secure storage** - Credentials encrypted using macOS Keychain
- ✅ **No tracking** - No analytics or telemetry

## Support

Having issues? Check:
1. This README's troubleshooting section
2. [GitHub Issues](https://github.com/yourname/freebusypaste/issues)
3. Ensure you've followed the Google API setup steps exactly

## Development

```bash
# Development mode
npm start

# Run tests
npm test

# Build for distribution
npm run build:mac
```

## License

MIT License - see LICENSE file for details.