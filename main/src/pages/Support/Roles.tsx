import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Users, Search, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRoleModal } from '@/components/forms/AddRoleModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockRoles = [
  { 
    id: 1, 
    name: 'Super Admin', 
    description: 'Full system access and permissions', 
    users: 2, 
    permissions: ['All Permissions'],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    isSystem: true
  },
  { 
    id: 2, 
    name: 'Manager', 
    description: 'Team management and lead oversight', 
    users: 5, 
    permissions: ['Lead Management', 'Team Management', 'Reports', 'Analytics'],
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    isSystem: false
  },
  { 
    id: 3, 
    name: 'Sales Agent', 
    description: 'Lead handling and customer interaction', 
    users: 15, 
    permissions: ['View Leads', 'Update Leads', 'Send SMS', 'Call Logs'],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    isSystem: false
  },
  { 
    id: 4, 
    name: 'Support Agent', 
    description: 'Customer support and ticket management', 
    users: 8, 
    permissions: ['View Tickets', 'Update Tickets', 'Knowledge Base', 'Chat Support'],
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    isSystem: false
  },
  { 
    id: 5, 
    name: 'Viewer', 
    description: 'Read-only access to reports and data', 
    users: 3, 
    permissions: ['View Reports', 'View Analytics'],
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    isSystem: false
  },
];

export default function SupportRoles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState(mockRoles);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRole = (roleId) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage user roles and access permissions</p>
        </div>
        <AddRoleModal trigger={
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        } />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Edit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{roles.filter(r => !r.isSystem).length}</p>
                  <p className="text-sm text-muted-foreground">Custom Roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Roles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="dashboard-widget">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                System Roles
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role, index) => (
                    <motion.tr
                      key={role.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge className={`${role.color} font-medium`}>
                            {role.name}
                          </Badge>
                          {role.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{role.users}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{role.permissions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!role.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Role
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredRoles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No roles found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Permission Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="dashboard-widget">
          <CardHeader>
            <CardTitle>Permission Categories</CardTitle>
            <p className="text-sm text-muted-foreground">
              Available permission groups across the system
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  name: 'Lead Management', 
                  permissions: 8, 
                  description: 'Create, edit, assign leads',
                  icon: '📊'
                },
                { 
                  name: 'User Management', 
                  permissions: 6, 
                  description: 'Manage team members',
                  icon: '👥'
                },
                { 
                  name: 'System Settings', 
                  permissions: 12, 
                  description: 'Configure system options',
                  icon: '⚙️'
                },
                { 
                  name: 'Reports & Analytics', 
                  permissions: 5, 
                  description: 'View performance data',
                  icon: '📈'
                },
                { 
                  name: 'Communication', 
                  permissions: 4, 
                  description: 'SMS, email, chat features',
                  icon: '💬'
                },
                { 
                  name: 'Support Features', 
                  permissions: 7, 
                  description: 'Tickets, knowledge base',
                  icon: '🎧'
                },
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{category.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {category.permissions} permissions
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}