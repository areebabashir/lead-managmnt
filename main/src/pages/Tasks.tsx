import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Flag,
  MessageSquare,
  MessageCircle,
  Paperclip,
  Eye,
  Users,
  Target,
  BarChart3,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { taskAPI, Task, TaskCreateRequest } from '../services/taskAPI';
import { userAPI, User as UserType } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';
import { CreateTaskModal, TaskDetailModal } from '../components/TaskModals';

// Sortable Task Item Component
interface SortableTaskItemProps {
  task: any;
  taskIndex: number;
  statusIndex: number;
  onTaskClick: (task: any) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  taskIndex,
  statusIndex,
  onTaskClick,
  getPriorityColor,
  getPriorityLabel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate task progress based on checklist
  const checklistProgress = task.checkList && task.checkList.length > 0 
    ? (task.checkList.filter((item: any) => item.completed).length / task.checkList.length) * 100 
    : 0;
  
  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: (statusIndex * 0.1) + (taskIndex * 0.05) }}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
        isOverdue ? 'border-l-red-500 bg-red-50' : 
        task.priority === 'urgent' ? 'border-l-red-400' :
        task.priority === 'high' ? 'border-l-orange-400' :
        task.priority === 'medium' ? 'border-l-yellow-400' :
        'border-l-gray-300'
      } ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      onClick={() => onTaskClick(task)}
      {...attributes}
      {...listeners}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded cursor-grab active:cursor-grabbing">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
            </div>
          </div>
          <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
            {task.title}
          </h4>
        </div>
        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
          {getPriorityLabel(task.priority)}
        </Badge>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress Bar for Checklist */}
      {task.checkList && task.checkList.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs text-gray-600">
              {task.checkList.filter((item: any) => item.completed).length}/{task.checkList.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${checklistProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[80px]">
                {task.assignedTo.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {task.dueDate && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Indicator */}
      {isOverdue && (
        <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full text-center">
          Overdue
        </div>
      )}
    </motion.div>
  );
};

// Task status and priority mappings
const taskStatuses = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
];

const taskPriorities = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

const taskTypes = [
  { value: 'task', label: 'Task' },
  { value: 'lead', label: 'Lead' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'other', label: 'Other' }
];

const getStatusColor = (status: string) => {
  const statusConfig = taskStatuses.find(s => s.value === status);
  return statusConfig ? `${statusConfig.color} text-white` : 'bg-gray-200 text-gray-700';
};

const getPriorityColor = (priority: string) => {
  const priorityConfig = taskPriorities.find(p => p.value === priority);
  return priorityConfig ? `${priorityConfig.color} text-white` : 'bg-gray-200 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const statusConfig = taskStatuses.find(s => s.value === status);
  return statusConfig ? statusConfig.label : status;
};

const getPriorityLabel = (priority: string) => {
  const priorityConfig = taskPriorities.find(p => p.value === priority);
  return priorityConfig ? priorityConfig.label : priority;
};

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "outline" | string;
  className?: string;
  onClick?: () => void;
};

const Button = ({ children, variant = "default", className = "", onClick }: ButtonProps) => {
  const baseClasses = "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

type TabsProps = { children: React.ReactNode; value: any; onValueChange: (v: any) => void };
const Tabs = ({ children, value, onValueChange }: TabsProps) => (
  <div className="w-full">
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, { activeTab: value, onTabChange: onValueChange })
        : child
    )}
  </div>
);

type TabsListProps = { children: React.ReactNode; activeTab?: any; onTabChange?: (v: any) => void };
const TabsList = ({ children, activeTab, onTabChange }: TabsListProps) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 mb-6">
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<any>, { activeTab, onTabChange })
        : child
    )}
  </div>
);

type TabsTriggerProps = { children: React.ReactNode; value: any; activeTab?: any; onTabChange?: (v: any) => void };
const TabsTrigger = ({ children, value, activeTab, onTabChange }: TabsTriggerProps) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
      activeTab === value 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-500 hover:text-gray-900'
    }`}
    onClick={() => onTabChange(value)}
  >
    {children}
  </button>
);

type TabsContentProps = { children: React.ReactNode; value: any; activeTab?: any };
const TabsContent = ({ children, value, activeTab }: TabsContentProps) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};


export default function Tasks() {
  const [view, setView] = useState('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    assignedTo: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { hasPermission } = useAuth();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      if (response.success) {
        const tasksData = Array.isArray(response.data) ? response.data : [];
        setTasks(tasksData);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesType = !filters.type || task.type === filters.type;
    const matchesAssignee = !filters.assignedTo || task.assignedTo?._id === filters.assignedTo;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAssignee;
  });

  const handleCreateTask = async (taskData: TaskCreateRequest) => {
    try {
      const response = await taskAPI.createTask(taskData);
      if (response.success && response.data) {
        // Ensure we have a single task, not an array
        const newTask = Array.isArray(response.data) ? response.data[0] : response.data;
        if (newTask) {
          setTasks(prev => [newTask, ...prev]);
          setShowCreateModal(false);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    try {
      const response = await taskAPI.updateTask(id, updates);
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task._id === id ? { ...task, ...updates } : task
        ));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await taskAPI.deleteTask(id);
      if (response.success) {
        setTasks(prev => prev.filter(task => task._id !== id));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete task');
    }
  };

  // Handle drag end for task status changes
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

    // Find the task being moved
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Update the task status optimistically
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, status: newStatus } as Task : t
    );
    setTasks(updatedTasks);

    try {
      // Update the task status on the server
      await taskAPI.updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert the optimistic update on error
      setTasks(tasks);
      setError('Failed to update task status');
    }
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {hasPermission('tasks', 'create') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'done').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {taskStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              {taskPriorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>

            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Assignees</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {task.assignedTo.name}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.checkList && task.checkList.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {task.checkList.filter(item => item.completed).length}/{task.checkList.length}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* Progress Overview */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="h-4 w-4" />
                Overall Progress
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Tasks */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {tasks.filter(task => task.status === 'done').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {tasks.filter(task => task.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Overdue */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">
                      {tasks.filter(task => 
                        task.dueDate && 
                        new Date(task.dueDate) < new Date() && 
                        task.status !== 'done'
                      ).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Completion</span>
                <span className="text-sm text-gray-600">
                  {tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'done').length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${tasks.length > 0 ? (tasks.filter(task => task.status === 'done').length / tasks.length) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {taskStatuses.map((status, statusIndex) => {
              const statusTasks = getTasksByStatus(status.value);
              const completedTasks = statusTasks.filter(task => task.status === 'done').length;
              const totalTasks = statusTasks.length;
              const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              
              return (
                <div key={status.value} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  {/* Column Header with Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.value).replace('bg-', 'bg-').replace('text-', 'text-')}`}></div>
                        {status.label}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {totalTasks}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    {status.value === 'done' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Progress Text */}
                    {status.value === 'done' && (
                      <p className="text-xs text-gray-600">
                        {completedTasks} of {totalTasks} completed ({Math.round(progressPercentage)}%)
                      </p>
                    )}
                  </div>

                  {/* Tasks Container */}
                  <SortableContext 
                    items={statusTasks.map(task => task._id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {statusTasks.map((task, taskIndex) => (
                        <SortableTaskItem
                          key={task._id}
                          task={task}
                          taskIndex={taskIndex}
                          statusIndex={statusIndex}
                          onTaskClick={(task) => {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }}
                          getPriorityColor={getPriorityColor}
                          getPriorityLabel={getPriorityLabel}
                        />
                      ))}
                    
                      {/* Empty State */}
                      {statusTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Plus className="h-6 w-6" />
                          </div>
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
          </DndContext>
        </TabsContent>
      </Tabs>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}