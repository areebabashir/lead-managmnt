const API_BASE_URL = 'http://localhost:8000/api';

export interface Contact {
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  province: string;
  country: string;
  dateOfBirth: string;
  status: 'New' | 'Existing' | 'First-Time Buyer';
  anniversary?: string;
  leadType?: string;
  referral?: {
    isReferral: boolean;
    referrer?: {
      _id: string;
      fullName: string;
      email: string;
    };
    referralDate?: string;
    referralNotes?: string;
  };
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  searchArea?: string;
  lastInteractionDate: string;
  source: 'website' | 'referral' | 'cold_call' | 'social_media' | 'advertising' | 'event' | 'facebook' | 'zapier' | 'other';
  isActive: boolean;
  createdBy?: {
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
}

export interface CreateContactData {
  email: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  province: string;
  country: string;
  dateOfBirth: string;
  status?: 'New' | 'Existing' | 'First-Time Buyer';
  anniversary?: string;
  leadType?: string;
  referral?: {
    isReferral?: boolean;
    referrer?: string;
    referralDate?: string;
    referralNotes?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  searchArea?: string;
  source?: string;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  leadType?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data: Contact;
}

export interface ContactsResponse {
  success: boolean;
  message?: string;
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data: {
    imported: number;
    errors: number;
    errorDetails: Array<{
      data: any;
      error: string;
    }>;
  };
}

class ContactAPI {
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

  // Get all contacts with filtering and pagination
  async getContacts(filters: ContactFilters = {}): Promise<ContactsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/contacts?${queryString}` : '/contacts';
    
    return this.makeRequest<ContactsResponse>(endpoint);
  }

  // Get single contact by ID
  async getContact(id: string): Promise<ContactResponse> {
    return this.makeRequest<ContactResponse>(`/contacts/${id}`);
  }

  // Create new contact
  async createContact(contactData: CreateContactData): Promise<ContactResponse> {
    return this.makeRequest<ContactResponse>('/contacts/create', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Update contact
  async updateContact(id: string, contactData: UpdateContactData): Promise<ContactResponse> {
    return this.makeRequest<ContactResponse>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  // Delete contact (soft delete)
  async deleteContact(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Update contact status
  async updateContactStatus(id: string, status: string): Promise<ContactResponse> {
    return this.makeRequest<ContactResponse>(`/contacts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Get contacts by status
  async getContactsByStatus(status: string): Promise<ContactsResponse> {
    return this.makeRequest<ContactsResponse>(`/contacts/status/${status}`);
  }

  // Get referral contacts
  async getReferralContacts(): Promise<ContactsResponse> {
    return this.makeRequest<ContactsResponse>('/contacts/referrals/all');
  }

  // Import contacts
  async importContacts(contacts: CreateContactData[]): Promise<ImportResponse> {
    return this.makeRequest<ImportResponse>('/contacts/import', {
      method: 'POST',
      body: JSON.stringify({ contacts }),
    });
  }

  // Export contacts
  async exportContacts(format: 'json' | 'csv' = 'json', filters?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    const endpoint = `/contacts/export?${queryParams.toString()}`;
    
    if (format === 'csv') {
      // For CSV export, we need to handle the response differently
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'contacts.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'Contacts exported successfully' };
    }

    return this.makeRequest(endpoint);
  }
}

export const contactAPI = new ContactAPI();
export type { Contact, CreateContactData, UpdateContactData, ContactFilters, ContactResponse, ContactsResponse, ImportResponse };
