import React, { useState } from 'react';
import { UserPlus, Edit, Trash, Shield } from 'lucide-react';

const mockStaff = [
  { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'active', lastLogin: '2024-01-15 10:30' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Manager', status: 'active', lastLogin: '2024-01-15 09:15' },
  { id: 3, name: 'Bob Wilson', email: 'bob@company.com', role: 'Agent', status: 'offline', lastLogin: '2024-01-14 18:45' },
  { id: 4, name: 'Alice Brown', email: 'alice@company.com', role: 'Agent', status: 'active', lastLogin: '2024-01-15 08:20' },
];

const getRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'admin': return 'bg-red-500 text-white';
    case 'manager': return 'bg-purple-500 text-white';
    case 'agent': return 'bg-blue-500 text-white';
    default: return 'bg-gray-200 text-gray-700';
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-500 text-white';
    case 'offline': return 'bg-gray-400 text-white';
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
  size?: "default" | "icon" | string;
  className?: string;
  onClick?: () => void;
};

const Button = ({ children, variant = "default", size = "default", className = "", onClick }: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  const sizeClasses = size === "icon" ? "h-9 w-9" : "px-4 py-2";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Avatar = ({ children, className = "" }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children }) => (
  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-medium text-gray-700">
    {children}
  </div>
);

const Table = ({ children }) => (
  <div className="relative w-full overflow-auto">
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="border-b">{children}</thead>
);

const TableBody = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`} style={style}>
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 align-middle ${className}`}>
    {children}
  </td>
);

const AddStaffModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
        Add Staff
      </Button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
              </select>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select Status</option>
                <option value="active">Active</option>
                <option value="offline">Offline</option>
              </select>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsOpen(false)}>Add Staff</Button>
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

export default function SetupStaff() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your team members and their permissions</p>
          </div>
          <AddStaffModal />
        </div>

        <div
          className="transform transition-all duration-300"
          style={{
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStaff.map((staff, index) => (
                    <TableRow
                      key={staff.id}
                      className="group"
                      style={{
                        animation: `fadeInUp 0.2s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{staff.name}</p>
                            <p className="text-xs text-gray-500">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(staff.role)}>
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {staff.lastLogin}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
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