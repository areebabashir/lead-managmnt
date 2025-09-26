const API_BASE_URL = 'http://localhost:8000/api';

interface Contact {
  _id: string;
  fullName: string;
  email: string;
  leadType?: string;
  status: string;
}

interface EmailGenerationRequest {
  contactId?: string;
  emailType: 'follow_up' | 'introduction' | 'proposal' | 'reminder' | 'thank_you' | 'custom';
  context: {
    subject?: string;
    tone?: 'professional' | 'friendly' | 'formal' | 'casual';
    keyPoints?: string[];
    callToAction?: string;
    customInstructions?: string;
  };
  subject?: string;
  body?: string;
}

interface Email {
  _id: string;
  subject: string;
  body: string;
  recipient: {
    email: string;
    name: string;
    contactId?: string;
  };
  sender: {
    userId: string;
    email: string;
    name: string;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'received';
  emailType: string;
  scheduledDate?: string;
  sentDate?: string;
  aiContext: {
    emailType: string;
    tone: string;
    keyPoints: string[];
    callToAction: string;
    customInstructions: string;
    generatedBy: 'ai' | 'manual';
    aiInteractionId?: string;
  };
  tracking: {
    opened: boolean;
    openedAt?: string;
    clicked: boolean;
    clickedAt?: string;
    replied: boolean;
    repliedAt?: string;
  };
  metadata: {
    gmailMessageId?: string;
    threadId?: string;
    labels?: string[];
    attachments?: Array<{
      filename: string;
      contentType: string;
      size: number;
      url: string;
      attachmentId?: string;
    }>;
    priority?: 'low' | 'normal' | 'high';
    tags?: string[];
    gmailLabels?: string[];
    isRead?: boolean;
    isStarred?: boolean;
    isImportant?: boolean;
    receivedDate?: string;
    emailDirection?: 'sent' | 'received';
  };
  createdAt: string;
  updatedAt: string;
}

interface EmailStats {
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  totalScheduled: number;
  schedulerStatus: {
    isRunning: boolean;
    activeJobs: string[];
    uptime: number;
  };
}

interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class EmailAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
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
      console.error(`Email API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Generate and save email as draft
  async generateAndSaveEmail(request: EmailGenerationRequest): Promise<APIResponse<{ email: Email; generatedContent: { subject: string; body: string } }>> {
    return this.makeRequest('/emails/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get contacts for email dropdown
  async getContactsForEmail(search: string = '', limit: number = 50): Promise<APIResponse<Contact[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    
    return this.makeRequest(`/emails/contacts?${params.toString()}`);
  }

  // Send email immediately
  async sendEmailNow(emailId: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/send`, {
      method: 'POST',
    });
  }

  // Schedule email for future sending
  async scheduleEmail(emailId: string, scheduledDate: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledDate }),
    });
  }

  // Save email as draft
  async saveEmailDraft(emailId: string, subject: string, body: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/draft`, {
      method: 'PUT',
      body: JSON.stringify({ subject, body }),
    });
  }

  // Get all emails for user
  async getUserEmails(page: number = 1, limit: number = 20, status?: string, contactId?: string): Promise<APIResponse<{ emails: Email[]; pagination: any }>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (contactId) params.append('contactId', contactId);
    
    return this.makeRequest(`/emails?${params.toString()}`);
  }

  // Get single email by ID
  async getEmailById(emailId: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}`);
  }

  // Cancel scheduled email
  async cancelScheduledEmail(emailId: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/cancel`, {
      method: 'DELETE',
    });
  }

  // Delete email (soft delete)
  async deleteEmail(emailId: string): Promise<APIResponse<void>> {
    return this.makeRequest(`/emails/${emailId}`, {
      method: 'DELETE',
    });
  }

  // Get email statistics
  async getEmailStats(): Promise<APIResponse<EmailStats>> {
    return this.makeRequest('/emails/stats');
  }

  // ==================== INBOX FUNCTIONALITY ====================

  // Get inbox emails (received emails)
  async getInboxEmails(
    page: number = 1, 
    limit: number = 20, 
    filters: {
      unreadOnly?: boolean;
      starredOnly?: boolean;
      label?: string;
    } = {}
  ): Promise<APIResponse<{ emails: Email[]; pagination: any }>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters.unreadOnly) params.append('unreadOnly', 'true');
    if (filters.starredOnly) params.append('starredOnly', 'true');
    if (filters.label) params.append('label', filters.label);
    
    return this.makeRequest(`/emails/inbox/list?${params.toString()}`);
  }

  // Get email thread (conversation)
  async getEmailThread(threadId: string): Promise<APIResponse<Email[]>> {
    return this.makeRequest(`/emails/thread/${threadId}`);
  }

  // Mark email as read/unread
  async markEmailAsRead(emailId: string, isRead: boolean = true): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ isRead }),
    });
  }

  // Star/unstar email
  async toggleEmailStar(emailId: string): Promise<APIResponse<Email>> {
    return this.makeRequest(`/emails/${emailId}/star`, {
      method: 'PUT',
    });
  }

  // Sync Gmail inbox emails
  async syncInboxEmails(maxResults: number = 50): Promise<APIResponse<{ synced: number; errors: any[]; totalErrors: number }>> {
    return this.makeRequest('/emails/inbox/sync', {
      method: 'POST',
      body: JSON.stringify({ maxResults }),
    });
  }
}

export const emailAPI = new EmailAPI();
export type { 
  Contact, 
  Email, 
  EmailGenerationRequest, 
  EmailStats, 
  APIResponse 
};
