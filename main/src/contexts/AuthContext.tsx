import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/authAPI';
import { roleAPI, Role, Permission } from '../services/roleAPI';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: Role;
  isSuperAdmin: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  userRole: string | null;
  userPermissions: Permission[];
  refreshUserPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh user permissions
  const refreshUserPermissions = async () => {
    if (!user) return;
    
    try {
      const response = await roleAPI.getUserPermissions(user._id);
      if (response.success && response.permissions) {
        setUserPermissions(response.permissions.rolePermissions || []);
      }
    } catch (error) {
      console.error('Error refreshing user permissions:', error);
      // If we can't fetch permissions, we'll rely on the role permissions from the user object
      if (user.role && user.role.permissions) {
        setUserPermissions(user.role.permissions || []);
      }
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid and get fresh user data
          const tokenResponse = await authAPI.verifyToken(storedToken);
          if (!tokenResponse.success) {
            logout();
          } else if (tokenResponse.user) {
            // Update user data with fresh data from server
            const userData: User = {
              _id: tokenResponse.user._id,
              name: tokenResponse.user.name,
              email: tokenResponse.user.email,
              phone: tokenResponse.user.phone,
              address: tokenResponse.user.address,
              role: tokenResponse.user.role as Role,
              isSuperAdmin: tokenResponse.user.isSuperAdmin || false,
              isActive: tokenResponse.user.isActive || true
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            // Fetch user permissions (non-blocking)
            refreshUserPermissions().catch(error => {
              console.error('Failed to refresh permissions:', error);
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userData: User = {
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          address: response.user.address,
          role: response.user.role as Role,
          isSuperAdmin: response.user.isSuperAdmin || false,
          isActive: response.user.isActive || true
        };
        
        setUser(userData);
        setToken(response.token);
        
        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Fetch user permissions (non-blocking)
        refreshUserPermissions().catch(error => {
          console.error('Failed to refresh permissions:', error);
        });
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserPermissions([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return true;
    }
    
    // First try to use the fetched userPermissions
    if (userPermissions.length > 0) {
      return userPermissions.some(permission => 
        permission.resource === resource && permission.action === action
      );
    }
    
    // Fallback to role permissions from user object
    if (user.role && user.role.permissions) {
      return user.role.permissions.some((permission: any) => 
        permission.resource === resource && permission.action === action
      );
    }
    
    return false;
  };


  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    hasPermission,
    userRole: user?.role?.name || null,
    userPermissions,
    refreshUserPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
