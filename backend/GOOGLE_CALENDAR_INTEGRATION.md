# Google Calendar Integration Guide

## Overview
This integration allows users to automatically create Google Calendar events with Google Meet links when they create meetings in the system. The integration includes:

- ✅ Automatic Google Calendar event creation
- ✅ Google Meet link generation
- ✅ Email invitations to attendees
- ✅ Event updates and deletions
- ✅ OAuth2 authentication flow

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8000/oauth2callback` (for development)
     - `https://yourdomain.com/oauth2callback` (for production)

### 2. Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/oauth2callback

# Email Configuration (for sending invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### 3. Database Schema Updates

The following fields have been added to the Meeting model:
- `googleEventId`: Stores the Google Calendar event ID
- `googleMeetLink`: Stores the Google Meet link
- `googleEventLink`: Stores the Google Calendar event link

The User model now includes:
- `googleTokens`: Stores OAuth2 tokens for Google Calendar access

## API Endpoints

### Google Calendar Authentication

#### Get Authorization URL
```
GET /api/google-calendar/auth-url
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

#### Handle OAuth Callback
```
POST /api/google-calendar/callback
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "authorization_code_from_google"
}
```

#### Check Connection Status
```
GET /api/google-calendar/status
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "success": true,
  "connected": true
}
```

#### Disconnect Google Calendar
```
DELETE /api/google-calendar/disconnect
Authorization: Bearer <jwt_token>
```

### Meeting Endpoints (Enhanced)

All existing meeting endpoints now support Google Calendar integration:

#### Create Meeting
```
POST /api/meetings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly team sync",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "attendees": ["user1@example.com", "user2@example.com"],
  "location": "Conference Room A",
  "type": "meeting",
  "priority": "high"
}
```

Response:
```json
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "_id": "meeting_id",
    "title": "Team Meeting",
    "googleEventId": "google_event_id",
    "googleMeetLink": "https://meet.google.com/abc-defg-hij",
    "googleEventLink": "https://calendar.google.com/event?eid=...",
    "googleCalendarCreated": true
  }
}
```

## How It Works

### 1. User Authentication Flow

1. User clicks "Connect Google Calendar" in the frontend
2. Frontend calls `/api/google-calendar/auth-url` to get authorization URL
3. User is redirected to Google OAuth consent screen
4. After consent, Google redirects to `/oauth2callback` with authorization code
5. Frontend calls `/api/google-calendar/callback` with the code
6. Backend exchanges code for tokens and stores them in user's profile

### 2. Meeting Creation Flow

1. User creates a meeting through the frontend
2. Backend creates meeting in database
3. If user has Google Calendar connected:
   - Creates Google Calendar event with Google Meet link
   - Updates meeting record with Google Calendar information
   - Sends email invitations to attendees
4. Returns meeting data including Google Meet link

### 3. Meeting Updates/Deletions

- **Update**: Updates both database and Google Calendar event
- **Delete**: Soft deletes from database and removes from Google Calendar

## Frontend Integration

### Connect Google Calendar

```javascript
// Get authorization URL
const response = await fetch('/api/google-calendar/auth-url', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { authUrl } = await response.json();

// Redirect user to Google OAuth
window.location.href = authUrl;
```

### Handle OAuth Callback

```javascript
// After user returns from Google OAuth
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  const response = await fetch('/api/google-calendar/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  
  if (response.ok) {
    console.log('Google Calendar connected successfully!');
  }
}
```

### Create Meeting with Google Calendar

```javascript
const meetingData = {
  title: "Team Meeting",
  description: "Weekly sync",
  date: "2024-01-15",
  startTime: "10:00",
  endTime: "11:00",
  attendees: ["colleague@example.com"]
};

const response = await fetch('/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(meetingData)
});

const result = await response.json();
if (result.success && result.data.googleMeetLink) {
  console.log('Google Meet Link:', result.data.googleMeetLink);
}
```

## Error Handling

The integration is designed to be resilient:

- If Google Calendar is not connected, meetings are still created in the database
- If Google Calendar API fails, the meeting creation doesn't fail
- All Google Calendar operations are wrapped in try-catch blocks
- Errors are logged but don't break the main functionality

## Security Considerations

1. **OAuth2 Tokens**: Stored securely in the database
2. **API Keys**: Never exposed to the frontend
3. **Email Credentials**: Use app-specific passwords for Gmail
4. **HTTPS**: Required for production OAuth redirects

## Testing

### Test Google Calendar Connection

1. Start the server: `npm start`
2. Get authorization URL: `GET /api/google-calendar/auth-url`
3. Complete OAuth flow
4. Check connection status: `GET /api/google-calendar/status`

### Test Meeting Creation

1. Create a meeting with attendees
2. Verify Google Calendar event is created
3. Check email invitations are sent
4. Verify Google Meet link is generated

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that redirect URI in Google Cloud Console matches your environment

2. **"Access denied"**
   - Ensure Google Calendar API is enabled
   - Check OAuth2 credentials are correct

3. **"Token expired"**
   - Implement token refresh logic
   - Re-authenticate user

4. **Email not sending**
   - Check SMTP credentials
   - Verify Gmail app password is used

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log detailed information about Google Calendar operations.

## Production Deployment

1. Update redirect URIs in Google Cloud Console
2. Use production environment variables
3. Enable HTTPS
4. Set up proper error monitoring
5. Implement token refresh logic for long-running sessions

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple meeting creation first
4. Ensure Google Calendar API quotas are not exceeded
