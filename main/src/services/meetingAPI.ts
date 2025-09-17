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

export interface Meeting {
  _id?: string;
  title: string;
  type: 'meeting' | 'appointment' | 'call' | 'personal';
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  reminder: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdBy?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Google Calendar integration fields
  googleEventId?: string;
  googleMeetLink?: string;
  googleEventLink?: string;
  googleCalendarCreated?: boolean;
}

export interface CreateMeetingData {
  title: string;
  type: 'meeting' | 'appointment' | 'call' | 'personal';
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  reminder: number;
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface MeetingFilters {
  status?: string;
  type?: string;
  priority?: string;
  date?: string;
}

// Create a new meeting
export const createMeeting = async (meetingData: CreateMeetingData): Promise<Meeting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create meeting');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Get all meetings with optional filters
export const getMeetings = async (filters: MeetingFilters = {}): Promise<Meeting[]> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const url = `${API_BASE_URL}/meetings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch meetings');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (): Promise<Meeting[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/upcoming`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch upcoming meetings');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

// Get today's meetings
export const getTodayMeetings = async (): Promise<Meeting[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/today`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch today\'s meetings');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching today\'s meetings:', error);
    throw error;
  }
};

// Get a specific meeting by ID
export const getMeetingById = async (id: string): Promise<Meeting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch meeting');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    throw error;
  }
};

// Update a meeting
export const updateMeeting = async (id: string, meetingData: UpdateMeetingData): Promise<Meeting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update meeting');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

// Update meeting status
export const updateMeetingStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<Meeting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update meeting status');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating meeting status:', error);
    throw error;
  }
};

// Delete a meeting
export const deleteMeeting = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete meeting');
    }
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};
