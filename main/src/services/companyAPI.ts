const API_BASE_URL = 'http://localhost:8000/api';

export interface Company {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  company?: Company;
  logo?: string;
}

class CompanyAPI {
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

  private async makeFileRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
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

  // Get company details
  async getCompany(): Promise<CompanyResponse> {
    return this.makeRequest<CompanyResponse>('/company');
  }

  // Update company details
  async updateCompany(companyData: CompanyFormData): Promise<CompanyResponse> {
    return this.makeRequest<CompanyResponse>('/company', {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // Upload company logo
  async uploadLogo(file: File): Promise<CompanyResponse> {
    const formData = new FormData();
    formData.append('logo', file);
    
    return this.makeFileRequest<CompanyResponse>('/company/logo', formData);
  }

  // Delete company logo
  async deleteLogo(): Promise<CompanyResponse> {
    return this.makeRequest<CompanyResponse>('/company/logo', {
      method: 'DELETE',
    });
  }
}

export const companyAPI = new CompanyAPI();


