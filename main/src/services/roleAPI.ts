const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  category: string;
  permissions: Permission[];
  isActive: boolean;
  isSystem: boolean;
  level: number;
}

interface UserWithRole {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  isSuperAdmin: boolean;
  isActive: boolean;
}

class RoleAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all roles
  async getAllRoles(): Promise<{ success: boolean; roles: Role[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return { success: false, roles: [], message: 'Failed to fetch roles' };
    }
  }

  // Get role by ID
  async getRoleById(roleId: string): Promise<{ success: boolean; role?: Role; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching role:', error);
      return { success: false, message: 'Failed to fetch role' };
    }
  }

  // Get available permissions
  async getAvailablePermissions(): Promise<{ success: boolean; permissions?: { resources: string[]; actions: string[] }; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/permissions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return { success: false, message: 'Failed to fetch permissions' };
    }
  }

  // Get user's permissions
  async getUserPermissions(userId: string): Promise<{ success: boolean; permissions?: { rolePermissions: Permission[]; customPermissions: any[]; isSuperAdmin: boolean }; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/permissions`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      console.log("user_permissions", data)
      return data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return { success: false, message: 'Failed to fetch user permissions' };
    }
  }

  // Create new role
  async createRole(roleData: { name: string; description: string; permissions: string[] }): Promise<{ success: boolean; role?: Role; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roleData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      return { success: false, message: 'Failed to create role' };
    }
  }

  // Update role
  async updateRole(roleId: string, roleData: { name?: string; description?: string; permissions?: string[] }): Promise<{ success: boolean; role?: Role; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(roleData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      return { success: false, message: 'Failed to update role' };
    }
  }

  // Delete role
  async deleteRole(roleId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting role:', error);
      return { success: false, message: 'Failed to delete role' };
    }
  }

  // Get role statistics
  async getRoleStats(): Promise<{ success: boolean; stats?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching role stats:', error);
      return { success: false, message: 'Failed to fetch role statistics' };
    }
  }
}

export const roleAPI = new RoleAPI();
export type { Role, Permission, UserWithRole };
