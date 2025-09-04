const API_BASE_URL = 'http://localhost:8000/api';

interface Task {
  _id: string;
  title: string;
  description?: string;
  type: 'task' | 'lead' | 'follow_up' | 'meeting' | 'call' | 'email' | 'campaign' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  board: string;
  column: string;
  position: number;
  dueDate?: string;
  startDate?: string;
  estimatedDuration?: {
    hours: number;
    minutes: number;
  };
  actualDuration?: {
    hours: number;
    minutes: number;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedDate: string;
  relatedContact?: {
    _id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
  relatedDeal?: {
    _id: string;
    name: string;
  };
  relatedCampaign?: {
    _id: string;
    name: string;
  };
  progress: number;
  checkList: Array<{
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
  }>;
  comments: Array<{
    content: string;
    createdBy: {
      _id: string;
      name: string;
    };
    createdAt: string;
    attachments?: Array<{
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
    }>;
  }>;
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
    uploadedAt: string;
  }>;
  tags: string[];
  category?: string;
  dependencies: Array<{
    task: string;
    type: 'blocks' | 'blocked_by' | 'related';
  }>;
  isActive: boolean;
  isTemplate: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskCreateRequest {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  board: string;
  column: string;
  position?: number;
  dueDate?: string;
  startDate?: string;
  estimatedDuration?: {
    hours: number;
    minutes: number;
  };
  assignedTo?: string;
  relatedContact?: string;
  relatedDeal?: string;
  relatedCampaign?: string;
  checkList?: Array<{
    item: string;
    completed?: boolean;
  }>;
  tags?: string[];
  category?: string;
}

interface TaskUpdateRequest {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status?: string;
  board?: string;
  column?: string;
  position?: number;
  dueDate?: string;
  startDate?: string;
  estimatedDuration?: {
    hours: number;
    minutes: number;
  };
  assignedTo?: string;
  relatedContact?: string;
  relatedDeal?: string;
  relatedCampaign?: string;
  progress?: number;
  checkList?: Array<{
    item: string;
    completed: boolean;
  }>;
  tags?: string[];
  category?: string;
}

interface TaskResponse {
  success: boolean;
  data?: Task | Task[];
  message?: string;
  error?: string;
}

interface TaskStats {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    cancelled: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: {
    task: number;
    lead: number;
    follow_up: number;
    meeting: number;
    call: number;
    email: number;
    campaign: number;
    other: number;
  };
  overdue: number;
  dueToday: number;
  assignedToMe: number;
}

class TaskAPI {
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
      console.error(`Task API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all tasks
  async getAllTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    board?: string;
    search?: string;
  }): Promise<TaskResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.makeRequest(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  // Get task by ID
  async getTaskById(id: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}`);
  }

  // Create new task
  async createTask(taskData: TaskCreateRequest): Promise<TaskResponse> {
    return this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Update task
  async updateTask(id: string, taskData: TaskUpdateRequest): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  // Delete task
  async deleteTask(id: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Get tasks by board
  async getTasksByBoard(boardName: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/board/${boardName}`);
  }

  // Get tasks by user
  async getTasksByUser(userId: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/user/${userId}`);
  }

  // Get my tasks
  async getMyTasks(): Promise<TaskResponse> {
    return this.makeRequest('/tasks/my-tasks');
  }

  // Get overdue tasks
  async getOverdueTasks(): Promise<TaskResponse> {
    return this.makeRequest('/tasks/overdue');
  }

  // Get tasks due today
  async getTasksDueToday(): Promise<TaskResponse> {
    return this.makeRequest('/tasks/due-today');
  }

  // Update task status
  async updateTaskStatus(id: string, status: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Update task priority
  async updateTaskPriority(id: string, priority: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  }

  // Assign task
  async assignTask(id: string, userId: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo: userId }),
    });
  }

  // Move task to column
  async moveTaskToColumn(id: string, column: string, position: number): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ column, position }),
    });
  }

  // Add comment to task
  async addComment(id: string, content: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Add checklist item
  async addChecklistItem(id: string, item: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ item }),
    });
  }

  // Complete checklist item
  async completeChecklistItem(id: string, itemIndex: number): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/checklist/${itemIndex}/complete`, {
      method: 'PATCH',
    });
  }

  // Get task statistics
  async getTaskStats(): Promise<{ success: boolean; data: TaskStats }> {
    return this.makeRequest('/tasks/stats');
  }

  // Get task templates
  async getTaskTemplates(): Promise<TaskResponse> {
    return this.makeRequest('/tasks/templates');
  }

  // Create task from template
  async createTaskFromTemplate(templateId: string, taskData: Partial<TaskCreateRequest>): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/templates/${templateId}/create`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Bulk update tasks
  async bulkUpdateTasks(taskIds: string[], updates: TaskUpdateRequest): Promise<TaskResponse> {
    return this.makeRequest('/tasks/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, updates }),
    });
  }

  // Get task activity log
  async getTaskActivity(id: string): Promise<TaskResponse> {
    return this.makeRequest(`/tasks/${id}/activity`);
  }
}

export const taskAPI = new TaskAPI();
export type { 
  Task, 
  TaskCreateRequest, 
  TaskUpdateRequest, 
  TaskResponse, 
  TaskStats 
};
