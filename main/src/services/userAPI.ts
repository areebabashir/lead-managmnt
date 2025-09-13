const API_BASE_URL = 'http://localhost:8000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: {
    _id: string;
    name: string;
    description?: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  createdAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleId: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  roleId?: string;
  password?: string;
}

interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[]; // Array of Permission IDs
}

interface UserStats {
  totalUsers: number;
  usersByRole: Array<{
    _id: string;
    count: number;
  }>;
  recentUsers: User[];
}

interface RoleStats {
  totalRoles: number;
  rolesWithUserCount: Array<{
    _id: string;
    name: string;
    description: string;
    userCount: number;
    permissions: Array<{
      resource: string;
      actions: string[];
    }>;
  }>;
}

class UserAPI {
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
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // User Management
  async getAllUsers(): Promise<{ success: boolean; users: User[] }> {
    return this.makeRequest('/users');
  }

  async getUserById(id: string): Promise<{ success: boolean; user: User }> {
    return this.makeRequest(`/users/${id}`);
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; user: User; message: string }> {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<{ success: boolean; user: User; message: string }> {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRole(userId: string, roleId: string): Promise<{ success: boolean; user: User; message: string }> {
    return this.makeRequest('/users/assign-role', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  async getUserStats(): Promise<{ success: boolean; stats: UserStats }> {
    return this.makeRequest('/users/stats');
  }

  // Role Management
  async getAllRoles(): Promise<{ success: boolean; roles: Role[] }> {
    return this.makeRequest('/roles');
  }

  async getRoleById(id: string): Promise<{ success: boolean; role: Role }> {
    return this.makeRequest(`/roles/${id}`);
  }

  async createRole(roleData: CreateRoleData): Promise<{ success: boolean; role: Role; message: string }> {
    return this.makeRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: Partial<CreateRoleData>): Promise<{ success: boolean; role: Role; message: string }> {
    return this.makeRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoleStats(): Promise<{ success: boolean; stats: RoleStats }> {
    return this.makeRequest('/roles/stats');
  }

  async getAvailablePermissions(): Promise<{ success: boolean; permissions: any[]; permissionsByResource: any }> {
    return this.makeRequest('/roles/permissions');
  }
}

export const userAPI = new UserAPI();
export type { User, Role, CreateUserData, UpdateUserData, CreateRoleData, UserStats, RoleStats };
