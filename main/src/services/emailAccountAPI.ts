const API_BASE_URL = 'http://localhost:8000/api';

export interface EmailAccount {
  _id: string;
  email: string;
  displayName: string;
  settings: {
    syncInbox: boolean;
    syncCalendar: boolean;
  };
  metadata: {
    lastSynced?: string;
    historyId?: string;
  };
  isActive: boolean;
  hasGoogleToken?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAccountFormData {
  email: string;
  displayName: string;
  google: {
    refreshToken: string;
    accessToken?: string;
    expiryDate?: string;
    scopes?: string[];
  };
}

export interface EmailAccountResponse {
  success: boolean;
  message: string;
  emailAccount?: EmailAccount;
  emailAccounts?: EmailAccount[];
}

class EmailAccountAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all email accounts
  async getEmailAccounts(): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>('/email-accounts');
  }

  // Get active email account
  async getActiveEmailAccount(): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>('/email-accounts/active');
  }

  // Create email account
  async createEmailAccount(emailAccountData: EmailAccountFormData): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>('/email-accounts', {
      method: 'POST',
      body: JSON.stringify(emailAccountData),
    });
  }

  // Update email account
  async updateEmailAccount(id: string, emailAccountData: Partial<EmailAccountFormData>): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>(`/email-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(emailAccountData),
    });
  }

  // Activate email account
  async activateEmailAccount(id: string): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>(`/email-accounts/${id}/activate`, {
      method: 'PATCH',
    });
  }

  // Delete email account
  async deleteEmailAccount(id: string): Promise<EmailAccountResponse> {
    return this.makeRequest<EmailAccountResponse>(`/email-accounts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const emailAccountAPI = new EmailAccountAPI();

