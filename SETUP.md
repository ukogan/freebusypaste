# FreeBusy Desktop Setup Guide

## Google Calendar API Setup

To use FreeBusy Desktop, you need to set up Google Calendar API credentials:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click and enable it

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in required fields (App name: "FreeBusy Desktop")
   - Add your email as a test user
4. Create OAuth client ID:
   - Application type: "Desktop application"
   - Name: "FreeBusy Desktop"
5. Download the credentials JSON file

### 3. Configure Environment Variables

Set these environment variables with your OAuth credentials:

```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

You can add these to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
echo 'export GOOGLE_CLIENT_ID="your-client-id-here"' >> ~/.zshrc
echo 'export GOOGLE_CLIENT_SECRET="your-client-secret-here"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Run FreeBusy

```bash
npm start
```

## Demo Mode (No Google Setup Required)

For testing without Google credentials, you can run in demo mode:

```bash
npm run demo
```

This will show fake availability data for demonstration purposes.

## Troubleshooting

### Error: "OAuth client was not found"
- Your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not set correctly
- Make sure you've enabled the Google Calendar API
- Verify your OAuth client is for "Desktop application" type

### App crashes after clicking "Connect to Google Calendar"
- Check the console output for error messages
- Ensure environment variables are set: `echo $GOOGLE_CLIENT_ID`

### Permission denied errors
- Make sure your Google OAuth consent screen is configured
- Add yourself as a test user if using "External" user type