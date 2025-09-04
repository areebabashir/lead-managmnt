
const API_BASE_URL = 'http://localhost:8000/api/auth';

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
  };
  token?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: any;
}

class AuthAPI {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
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

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    answer: string;
  }): Promise<RegisterResponse> {
    return this.makeRequest<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.makeRequest('/user-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateProfile(profileData: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    address?: string;
  }): Promise<any> {
    return this.makeRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async forgotPassword(email: string, answer: string, newPassword: string): Promise<any> {
    return this.makeRequest('/ForgetPassword', {
      method: 'POST',
      body: JSON.stringify({ email, answer, newPassword }),
    });
  }
}

export const authAPI = new AuthAPI();
