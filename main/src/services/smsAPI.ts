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

export interface SMSMessage {
  _id: string;
  message: string;
  sentBy: {
    _id: string;
    name: string;
    email: string;
  };
  recipientType: 'lead' | 'staff';
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  twilioSid: string;
  twilioStatus: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  twilioErrorCode?: string;
  twilioErrorMessage?: string;
  messageLength: number;
  segments: number;
  cost: number;
  sentAt: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendSMSData {
  message: string;
  recipientId: string;
  recipientType: 'lead' | 'staff';
}

export interface SendBulkSMSData {
  message: string;
  recipients: Array<{
    id: string;
    type: 'lead' | 'staff';
  }>;
}

export interface SMSStats {
  totalMessages: number;
  totalCost: number;
  totalSegments: number;
  deliveredCount: number;
  failedCount: number;
}

export interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface SMSHistoryResponse {
  success: boolean;
  data: SMSMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SMSAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`SMS API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Send SMS to single recipient
  async sendSMS(smsData: SendSMSData): Promise<SMSResponse> {
    return this.makeRequest<SMSResponse>('/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
  }

  // Send SMS to multiple recipients
  async sendBulkSMS(smsData: SendBulkSMSData): Promise<SMSResponse> {
    return this.makeRequest<SMSResponse>('/sms/send-bulk', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
  }

  // Get SMS history
  async getSMSHistory(filters: {
    page?: number;
    limit?: number;
    recipientType?: 'lead' | 'staff';
    status?: string;
  } = {}): Promise<SMSHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/sms/history?${queryString}` : '/sms/history';
    
    return this.makeRequest<SMSHistoryResponse>(endpoint);
  }

  // Get SMS statistics
  async getSMSStats(): Promise<{ success: boolean; data: SMSStats }> {
    return this.makeRequest<{ success: boolean; data: SMSStats }>('/sms/stats');
  }

  // Get conversation with specific contact
  async getConversation(
    recipientId: string, 
    recipientType: 'lead' | 'staff',
    filters: { page?: number; limit?: number } = {}
  ): Promise<SMSHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/sms/conversation/${recipientType}/${recipientId}?${queryString}` 
      : `/sms/conversation/${recipientType}/${recipientId}`;
    
    return this.makeRequest<SMSHistoryResponse>(endpoint);
  }
}

export const smsAPI = new SMSAPI();
export type { SMSMessage, SendSMSData, SendBulkSMSData, SMSStats, SMSResponse, SMSHistoryResponse };

