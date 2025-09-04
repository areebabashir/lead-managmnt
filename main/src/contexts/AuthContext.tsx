import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/authAPI';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const isValid = await authAPI.verifyToken(storedToken);
          if (!isValid) {
            logout();
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
        setUser(response.user);
        setToken(response.token);
        
        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.role) return false;
    
    // Define role-based permissions
    const rolePermissions: { [key: string]: { [key: string]: string[] } } = {
      'Super Admin': {
        'contacts': ['create', 'read', 'update', 'delete', 'export', 'import'],
        'tasks': ['create', 'read', 'update', 'delete', 'assign'],
        'campaigns': ['create', 'read', 'update', 'delete', 'send'],
        'ai_generator': ['generate', 'analyze', 'configure'],
        'dashboards': ['read', 'export'],
        'users': ['create', 'read', 'update', 'delete', 'assign'],
        'roles': ['create', 'read', 'update', 'delete'],
        'settings': ['read', 'update']
      },
      'Sales Director': {
        'contacts': ['create', 'read', 'update', 'export'],
        'tasks': ['create', 'read', 'update', 'assign'],
        'campaigns': ['create', 'read', 'update', 'send'],
        'ai_generator': ['generate', 'analyze'],
        'dashboards': ['read', 'export'],
        'users': ['read', 'assign'],
        'roles': ['read'],
        'settings': ['read']
      },
      'Sales Manager': {
        'contacts': ['create', 'read', 'update'],
        'tasks': ['create', 'read', 'update', 'assign'],
        'campaigns': ['create', 'read', 'update'],
        'ai_generator': ['generate'],
        'dashboards': ['read'],
        'users': ['read'],
        'roles': ['read'],
        'settings': ['read']
      },
      'Sales Representative': {
        'contacts': ['create', 'read', 'update'],
        'tasks': ['create', 'read', 'update'],
        'campaigns': ['read'],
        'ai_generator': ['generate'],
        'dashboards': ['read'],
        'users': ['read'],
        'roles': [],
        'settings': []
      },
      'Marketing Specialist': {
        'contacts': ['read'],
        'tasks': ['read'],
        'campaigns': ['create', 'read', 'update', 'send'],
        'ai_generator': ['generate', 'analyze'],
        'dashboards': ['read'],
        'users': ['read'],
        'roles': ['read'],
        'settings': ['read']
      },
      'Customer Success Manager': {
        'contacts': ['read', 'update'],
        'tasks': ['create', 'read', 'update'],
        'campaigns': ['read'],
        'ai_generator': ['generate'],
        'dashboards': ['read'],
        'users': ['read'],
        'roles': ['read'],
        'settings': ['read']
      }
    };

    const userRole = user.role;
    const permissions = rolePermissions[userRole];
    
    if (!permissions || !permissions[resource]) {
      return false;
    }
    
    return permissions[resource].includes(action);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    hasPermission,
    userRole: user?.role || null
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
