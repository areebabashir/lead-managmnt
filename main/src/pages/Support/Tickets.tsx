import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  MoreVertical, 
  Eye,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTicketModal } from '@/components/forms/AddTicketModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockTickets = [
  { 
    id: '#T001', 
    title: 'Login issues with new account', 
    customer: 'John Smith', 
    priority: 'high', 
    status: 'open', 
    created: '2024-01-15', 
    agent: 'Jane Doe',
    responses: 3,
    lastActivity: '2 hours ago'
  },
  { 
    id: '#T002', 
    title: 'Feature request: Export functionality', 
    customer: 'Alice Brown', 
    priority: 'medium', 
    status: 'in-progress', 
    created: '2024-01-14', 
    agent: 'Bob Wilson',
    responses: 7,
    lastActivity: '1 day ago'
  },
  { 
    id: '#T003', 
    title: 'Billing inquiry about subscription', 
    customer: 'Mike Johnson', 
    priority: 'low', 
    status: 'resolved', 
    created: '2024-01-13', 
    agent: 'Sarah Lee',
    responses: 4,
    lastActivity: '3 days ago'
  },
  { 
    id: '#T004', 
    title: 'API integration help needed', 
    customer: 'Tech Corp', 
    priority: 'high', 
    status: 'open', 
    created: '2024-01-15', 
    agent: 'Unassigned',
    responses: 0,
    lastActivity: '4 hours ago'
  },
  { 
    id: '#T005', 
    title: 'Password reset not working', 
    customer: 'Emma Davis', 
    priority: 'medium', 
    status: 'in-progress', 
    created: '2024-01-12', 
    agent: 'Jane Doe',
    responses: 5,
    lastActivity: '30 minutes ago'
  },
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'open': return AlertCircle;
    case 'in-progress': return Clock;
    case 'resolved': return CheckCircle;
    case 'closed': return CheckCircle;
    default: return AlertCircle;
  }
};

export default function SupportTickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState(mockTickets);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage customer support tickets and requests</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 shadow-sm">
            <Filter className="h-4 w-4" />
            Export
          </Button>
          <AddTicketModal trigger={
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          } />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Open', 
            count: stats.open, 
            icon: AlertCircle, 
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900'
          },
          { 
            title: 'In Progress', 
            count: stats.inProgress, 
            icon: Clock, 
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-100 dark:bg-orange-900'
          },
          { 
            title: 'Resolved', 
            count: stats.resolved, 
            icon: CheckCircle, 
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-100 dark:bg-green-900'
          },
          { 
            title: 'Total', 
            count: stats.total, 
            icon: MessageSquare, 
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${stat.bg} rounded-lg`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets by title, customer, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tickets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="dashboard-widget">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              All Tickets
              <Badge variant="secondary" className="ml-2">
                {filteredTickets.length} of {tickets.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket, index) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    return (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group cursor-pointer hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{ticket.id}</span>
                              {ticket.responses > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {ticket.responses} replies
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm max-w-xs truncate">{ticket.title}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ticket.customer}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {ticket.agent !== 'Unassigned' ? (
                              <>
                                <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {ticket.agent.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm">{ticket.agent}</span>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Unassigned
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {ticket.created}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {ticket.lastActivity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Add Response
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(ticket.id, 'in-progress')}
                                  disabled={ticket.status === 'in-progress'}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                  disabled={ticket.status === 'resolved'}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Resolved
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tickets found matching your criteria.</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Urgent Tickets</p>
                  <p className="text-xs text-muted-foreground">
                    {tickets.filter(t => t.priority === 'high' && t.status === 'open').length} high priority open
                  </p>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Unassigned</p>
                  <p className="text-xs text-muted-foreground">
                    {tickets.filter(t => t.agent === 'Unassigned').length} tickets need assignment
                  </p>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Resolved Today</p>
                  <p className="text-xs text-muted-foreground">
                    {tickets.filter(t => t.status === 'resolved').length} tickets completed
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}