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

export interface DashboardStats {
  totalLeads: number;
  totalUsers: number;
  totalTasks: number;
  totalMeetings: number;
  totalSMS: number;
  leadsThisMonth: number;
  tasksCompleted: number;
  meetingsScheduled: number;
  smsDelivered: number;
  // Growth percentages
  leadsGrowth: number;
  tasksGrowth: number;
  usersGrowth: number;
  meetingsGrowth: number;
}

export interface LeadsChartData {
  month: string;
  leads: number;
  conversions: number;
}

export interface LeadsStageData {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'lead' | 'task' | 'meeting' | 'sms';
}

class DashboardAPI {
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
      console.error(`Dashboard API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    return this.makeRequest<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
  }

  // Get leads chart data (monthly)
  async getLeadsChartData(): Promise<{ success: boolean; data: LeadsChartData[] }> {
    return this.makeRequest<{ success: boolean; data: LeadsChartData[] }>('/dashboard/leads-chart');
  }

  // Get leads by stage data
  async getLeadsStageData(): Promise<{ success: boolean; data: LeadsStageData[] }> {
    return this.makeRequest<{ success: boolean; data: LeadsStageData[] }>('/dashboard/leads-stages');
  }

  // Get recent activities
  async getRecentActivities(): Promise<{ success: boolean; data: RecentActivity[] }> {
    return this.makeRequest<{ success: boolean; data: RecentActivity[] }>('/dashboard/activities');
  }
}

export const dashboardAPI = new DashboardAPI();
export type { DashboardStats, LeadsChartData, LeadsStageData, RecentActivity };
