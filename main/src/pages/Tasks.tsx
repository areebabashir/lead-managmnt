import React, { useState } from 'react';
import { Plus, Filter, Calendar, User, AlertCircle } from 'lucide-react';

const mockTasks = [
  { id: 1, title: 'Follow up with lead #1234', status: 'pending', priority: 'high', assignee: 'John Doe', dueDate: '2024-01-15' },
  { id: 2, title: 'Review contract proposal', status: 'in-progress', priority: 'medium', assignee: 'Jane Smith', dueDate: '2024-01-16' },
  { id: 3, title: 'Prepare monthly report', status: 'done', priority: 'low', assignee: 'Bob Wilson', dueDate: '2024-01-14' },
  { id: 4, title: 'Client onboarding call', status: 'pending', priority: 'high', assignee: 'Alice Brown', dueDate: '2024-01-17' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-orange-500 text-white';
    case 'in-progress': return 'bg-blue-500 text-white';
    case 'done': return 'bg-green-500 text-white';
    default: return 'bg-gray-200 text-gray-700';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-orange-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-200 text-gray-700';
  }
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

const AddTaskModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Task
      </Button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input 
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsOpen(false)}>Save Task</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function Tasks() {
  const [view, setView] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage and track all your tasks</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <AddTaskModal />
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
              {mockTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="transform transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {task.assignee}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {task.dueDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {['Pending', 'In Progress', 'Done'].map((status) => (
                <Card key={status} className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">{status}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockTasks
                      .filter(task => task.status === status.toLowerCase().replace(' ', '-'))
                      .map((task) => (
                        <Card key={task.id} className="p-4 bg-white hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-gray-600">{task.assignee}</span>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}