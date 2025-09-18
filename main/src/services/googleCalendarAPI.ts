const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get headers
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface GoogleCalendarStatus {
  connected: boolean;
  message?: string;
}

export interface GoogleCalendarAuthResponse {
  authUrl: string;
}

export interface GoogleCalendarCallbackResponse {
  success: boolean;
  message: string;
}

// Get Google Calendar authorization URL
export const getGoogleCalendarAuthUrl = async (): Promise<GoogleCalendarAuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-calendar/auth-url`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get Google Calendar auth URL');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting Google Calendar auth URL:', error);
    throw error;
  }
};

// Handle Google Calendar OAuth callback
export const handleGoogleCalendarCallback = async (code: string): Promise<GoogleCalendarCallbackResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-calendar/callback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to connect Google Calendar');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error);
    throw error;
  }
};

// Check Google Calendar connection status
export const getGoogleCalendarStatus = async (): Promise<GoogleCalendarStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-calendar/status`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check Google Calendar status');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    throw error;
  }
};

// Disconnect Google Calendar
export const disconnectGoogleCalendar = async (): Promise<GoogleCalendarCallbackResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-calendar/disconnect`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to disconnect Google Calendar');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    throw error;
  }
};

// Google Calendar integration helper functions
export class GoogleCalendarIntegration {
  // Connect to Google Calendar
  static async connect(): Promise<void> {
    try {
      const { authUrl } = await getGoogleCalendarAuthUrl();
      
      // For now, redirect to the auth URL directly instead of using popup
      // This avoids popup blocking issues and redirect URI problems
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      throw error;
    }
  }

  // Check if Google Calendar is connected
  static async isConnected(): Promise<boolean> {
    try {
      const status = await getGoogleCalendarStatus();
      return status.connected;
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      return false;
    }
  }

  // Get connection status with message
  static async getConnectionStatus(): Promise<GoogleCalendarStatus> {
    try {
      const status = await getGoogleCalendarStatus();
      return {
        connected: status.connected,
        message: status.message || (status.connected ? 'Google Calendar connected successfully' : 'Google Calendar not connected - invalid credentials')
      };
    } catch (error) {
      console.error('Error getting Google Calendar status:', error);
      return {
        connected: false,
        message: 'Failed to connect to Google Calendar - server error'
      };
    }
  }

  // Disconnect from Google Calendar
  static async disconnect(): Promise<void> {
    try {
      await disconnectGoogleCalendar();
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      throw error;
    }
  }
}
