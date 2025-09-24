import { google } from 'googleapis';
import EmailAccount from '../models/emailAccountModel.js';
import Company from '../models/companyModel.js';

// Test endpoint to check configuration
export const testGoogleConfig = (req, res) => {
  const config = {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasRedirectUri: !!process.env.REDIRECT_URI,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    redirectUri: process.env.REDIRECT_URI,
    frontendUrl: process.env.FRONTEND_URL
  };
  
  console.log('Google OAuth Configuration:', config);
  res.json(config);
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI // e.g. http://localhost:5000/api/google/callback
);

// Step 1: Redirect user to Google
export const startGoogleAuth = (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.REDIRECT_URI) {
      console.error('Missing required Google OAuth environment variables');
      return res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=config_error`);
    }

    const scopes = [
      'https://mail.google.com/',
      'https://www.googleapis.com/auth/calendar',

    ];

    console.log('Starting Google OAuth with scopes:', scopes);
    console.log('Redirect URI:', process.env.REDIRECT_URI);

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // ensures refresh_token is returned
      scope: scopes
    });

    console.log('Generated auth URL:', url);
    res.redirect(url);
  } catch (error) {
    console.error('Error starting Google auth:', error);
    res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=auth_start_failed`);
  }
};

// Step 2: Handle callback
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    // Check for OAuth error
    if (error) {
      console.error('OAuth error from Google:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=auth_failed`);
    }

    // Check if authorization code is present
    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=no_code`);
    }

    console.log('Received authorization code, exchanging for tokens...');
    console.log('Authorization code:', code);
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token, 
      hasRefreshToken: !!tokens.refresh_token,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      expiryDate: tokens.expiry_date,
      email: tokens.email // Check if email is in token response
    });

    // Validate that we have the required tokens
    if (!tokens.access_token) {
      console.error('No access token received');
      return res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=no_access_token`);
    }

    if (!tokens.refresh_token) {
      console.error('No refresh token received - this is required for offline access');
      return res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=no_refresh_token`);
    }

    // Store tokens and redirect to frontend for email input
    console.log('Tokens received successfully, redirecting to frontend for email input...');
    
    // Store tokens data (no email - user will enter it manually)
    const tokenData = {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      scopes: tokens.scope?.split(' ') || []
    };
    
    // Encode the token data to pass it to the frontend
    const encodedTokens = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    // Redirect to frontend with tokens and open modal
    res.redirect(`${process.env.FRONTEND_URL}/support/settings?google_tokens=${encodedTokens}&open_modal=true`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/support/settings?error=auth_failed`);
  }
};
