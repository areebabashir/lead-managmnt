# Google OAuth Setup Guide - Fix Redirect URI Error

## 🚨 **Current Issue**
You're getting: `Error 400: invalid_request - Missing required parameter: redirect_uri`

## 🔧 **Step-by-Step Fix**

### **Step 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Enable Google Calendar API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - **IMPORTANT**: Add these Authorized redirect URIs:
     ```
     http://localhost:8000/oauth2callback
     http://localhost:8000/api/google-calendar/callback
     http://localhost:5173/google-calendar-callback
     ```

4. **Copy Your Credentials**
   - Copy the Client ID and Client Secret

### **Step 2: Update Backend .env File**

Create or update your `backend/.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/melnitz
PORT=8000
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_from_google_cloud
GOOGLE_CLIENT_SECRET=your_actual_client_secret_from_google_cloud
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-calendar/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (for sending invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### **Step 3: Test the Setup**

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   cd main
   npm run dev
   ```

3. **Test Google Calendar Connection**
   - Go to http://localhost:5173
   - Click "Connect Google Calendar" in the dashboard
   - You should be redirected to Google OAuth
   - After authorization, you'll be redirected back to your app

### **Step 4: Verify Everything Works**

1. **Create a Test Meeting**
   - Click on any date in the calendar
   - Fill out the meeting form
   - Add attendees (email addresses)
   - Click "Schedule Meeting"

2. **Check Results**
   - Meeting should be created in your database
   - Google Calendar event should be created (if connected)
   - Google Meet link should be generated
   - Email invitations should be sent to attendees

## 🔍 **Troubleshooting**

### **Still Getting Redirect URI Error?**

1. **Check Google Cloud Console**
   - Make sure the redirect URI is exactly: `http://localhost:8000/api/google-calendar/callback`
   - No trailing slashes
   - No typos

2. **Check .env File**
   - Make sure `GOOGLE_REDIRECT_URI` matches what's in Google Cloud Console
   - Restart your backend server after changing .env

3. **Clear Browser Cache**
   - Clear cookies and cache
   - Try in incognito/private mode

### **Other Common Issues**

1. **"Access blocked" Error**
   - Make sure your Google account has access to the project
   - Check if the OAuth consent screen is configured

2. **"Invalid client" Error**
   - Double-check Client ID and Client Secret
   - Make sure they're from the correct project

3. **"Scope not authorized" Error**
   - Make sure Google Calendar API is enabled
   - Check OAuth consent screen configuration

## 📋 **OAuth Consent Screen Setup**

If you haven't set up the OAuth consent screen:

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" (unless you have a Google Workspace)
3. Fill in required fields:
   - App name: "Melnitz AI Sales Assistant"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email address)

## 🚀 **Production Setup**

For production deployment:

1. **Update Redirect URIs in Google Cloud Console**
   ```
   https://yourdomain.com/api/google-calendar/callback
   https://yourdomain.com/google-calendar-callback
   ```

2. **Update .env File**
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-calendar/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Publish OAuth Consent Screen**
   - Go to OAuth consent screen
   - Click "Publish App"
   - This removes the "unverified app" warning

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ No redirect URI errors
2. ✅ Google OAuth page loads correctly
3. ✅ After authorization, you're redirected back to your app
4. ✅ "Google Calendar Connected" status shows in dashboard
5. ✅ Meetings are created with Google Meet links
6. ✅ Email invitations are sent to attendees

## 🆘 **Still Having Issues?**

If you're still having problems:

1. **Check the browser console** for any JavaScript errors
2. **Check the backend logs** for any server errors
3. **Verify all URLs** are correct and accessible
4. **Test with a simple curl request** to verify the backend is working

Let me know if you need help with any specific step!
