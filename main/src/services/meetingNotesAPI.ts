const API_BASE_URL = 'http://localhost:8000/api';

// Types for Meeting Notes API
export interface MeetingNoteParticipant {
  name?: string;
  email?: string;
  contactId?: string;
  type: 'simple' | 'contact';
}

export interface MeetingNote {
  _id: string;
  meetingTitle: string;
  meetingDate: string;
  participants: MeetingNoteParticipant[];
  audioFileUrl: string;
  audioFileName?: string;
  audioFileSize?: number;
  transcription?: string;
  rawTranscriptData?: any;
  summary?: string;
  duration?: string;
  confidence?: number;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  summaryStatus: 'pending' | 'processing' | 'completed' | 'failed';
  tags: string[];
  category?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TranscriptResponse {
  success: boolean;
  message: string;
  data: {
    audioFileUrl: string;
    audioFileName: string;
    audioFileSize: number;
    transcript: string;
    confidence: number;
    duration: string;
    segments: Array<{
      text: string;
      confidence: number;
      endTime: string;
    }>;
    rawTranscriptData: any;
  };
}

export interface SummaryRequest {
  transcript: string;
  meetingTitle?: string;
  participants?: string[];
  duration?: string;
  confidence?: number;
}

export interface SummaryResponse {
  success: boolean;
  message: string;
  data: {
    summary: string;
    isCached: boolean;
  };
}

export interface CreateMeetingNoteRequest {
  meetingTitle: string;
  meetingDate: string;
  participants: MeetingNoteParticipant[];
  audioFileUrl: string;
  audioFileName?: string;
  audioFileSize?: number;
  transcription?: string;
  rawTranscriptData?: any;
  summary?: string;
  duration?: string;
  confidence?: number;
  tags?: string[];
  category?: string;
}

export interface UpdateMeetingNoteRequest {
  meetingTitle?: string;
  meetingDate?: string;
  participants?: MeetingNoteParticipant[];
  transcription?: string;
  summary?: string;
  tags?: string[];
  category?: string;
}

export interface MeetingNotesListResponse {
  success: boolean;
  data: MeetingNote[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MeetingNotesStatsResponse {
  success: boolean;
  data: {
    totalNotes: number;
    recentNotes: number;
    processingNotes: number;
    categoryStats: Array<{
      _id: string;
      count: number;
    }>;
    monthlyStats: Array<{
      _id: {
        year: number;
        month: number;
      };
      count: number;
    }>;
  };
}

export interface MeetingNotesListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class MeetingNotesAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Meeting Notes API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Generate transcript from audio file
  async generateTranscript(audioFile: File, languageCode: string = 'en-US'): Promise<TranscriptResponse> {
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('languageCode', languageCode);

    return this.makeRequest('/meeting-notes/transcript', {
      method: 'POST',
      body: formData,
    });
  }

  // Generate summary from transcript
  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    return this.makeRequest('/meeting-notes/summary', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Create meeting note
  async createMeetingNote(request: CreateMeetingNoteRequest): Promise<{ success: boolean; data: MeetingNote; message: string }> {
    return this.makeRequest('/meeting-notes', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all meeting notes with pagination and filters
  async getMeetingNotes(params: MeetingNotesListParams = {}): Promise<MeetingNotesListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/meeting-notes${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  // Get single meeting note by ID
  async getMeetingNote(id: string): Promise<{ success: boolean; data: MeetingNote }> {
    return this.makeRequest(`/meeting-notes/${id}`);
  }

  // Update meeting note
  async updateMeetingNote(id: string, request: UpdateMeetingNoteRequest): Promise<{ success: boolean; data: MeetingNote; message: string }> {
    return this.makeRequest(`/meeting-notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Delete meeting note (soft delete)
  async deleteMeetingNote(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/meeting-notes/${id}`, {
      method: 'DELETE',
    });
  }

  // Get meeting notes statistics
  async getMeetingNotesStats(): Promise<MeetingNotesStatsResponse> {
    return this.makeRequest('/meeting-notes/stats');
  }

  // Utility method to validate audio file
  validateAudioFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.includes('audio/wav') && !file.name.toLowerCase().endsWith('.wav')) {
      return { valid: false, error: 'Only WAV audio files are supported' };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    // Check minimum file size (1KB)
    const minSize = 1024; // 1KB
    if (file.size < minSize) {
      return { valid: false, error: 'File is too small to be a valid audio file' };
    }

    return { valid: true };
  }

  // Utility method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility method to format duration
  formatDuration(duration: string): string {
    if (!duration) return '0s';
    
    // Handle formats like "10s", "1m30s", "1h30m45s"
    const match = duration.match(/(\d+)s$/);
    if (match) {
      const seconds = parseInt(match[1]);
      if (seconds < 60) {
        return `${seconds}s`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        let result = `${hours}h`;
        if (minutes > 0) result += ` ${minutes}m`;
        if (remainingSeconds > 0) result += ` ${remainingSeconds}s`;
        return result;
      }
    }
    
    return duration;
  }

  // Utility method to get confidence color
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Utility method to get confidence label
  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  }
}

export const meetingNotesAPI = new MeetingNotesAPI();
export default meetingNotesAPI;

