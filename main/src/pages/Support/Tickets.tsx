import React, { useState } from "react";
import { motion } from "framer-motion";
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
  User,
} from "lucide-react";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

// ✅ Define ticket type
interface Ticket {
  id: string;
  title: string;
  customer: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved" | "closed";
  created: string;
  agent: string;
  responses: number;
  lastActivity: string;
}

// Mock Tickets Data
const mockTickets: Ticket[] = [
  {
    id: "#T001",
    title: "Login issues with new account",
    customer: "John Smith",
    priority: "high",
    status: "open",
    created: "2024-01-15",
    agent: "Jane Doe",
    responses: 3,
    lastActivity: "2 hours ago",
  },
  {
    id: "#T002",
    title: "Feature request: Export functionality",
    customer: "Alice Brown",
    priority: "medium",
    status: "in-progress",
    created: "2024-01-14",
    agent: "Bob Wilson",
    responses: 7,
    lastActivity: "1 day ago",
  },
  {
    id: "#T003",
    title: "Billing inquiry about subscription",
    customer: "Mike Johnson",
    priority: "low",
    status: "resolved",
    created: "2024-01-13",
    agent: "Sarah Lee",
    responses: 4,
    lastActivity: "3 days ago",
  },
  {
    id: "#T004",
    title: "API integration help needed",
    customer: "Tech Corp",
    priority: "high",
    status: "open",
    created: "2024-01-15",
    agent: "Unassigned",
    responses: 0,
    lastActivity: "4 hours ago",
  },
  {
    id: "#T005",
    title: "Password reset not working",
    customer: "Emma Davis",
    priority: "medium",
    status: "in-progress",
    created: "2024-01-12",
    agent: "Jane Doe",
    responses: 5,
    lastActivity: "30 minutes ago",
  },
];

// Priority Colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-orange-100 text-orange-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Status Colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-orange-100 text-black";
    case "in-progress":
      return "bg-orange-100 text-black";
    case "resolved":
      return "bg-orange-100 text-black";
    case "closed":
      return "bg-orange-100 text-black";
    default:
      return "bg-orange-100 text-black";
  }
};

// Status Icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return AlertCircle;
    case "in-progress":
      return Clock;
    case "resolved":
      return CheckCircle;
    case "closed":
      return CheckCircle;
    default:
      return AlertCircle;
  }
};

export default function SupportTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  // ✅ Typed custom styles
  const customStyles: TableStyles = {
    headCells: { style: { justifyContent: "center", color: "#000" } },
    cells: { style: { justifyContent: "center", textAlign: "center" } },
    headRow: {
      style: {
        backgroundColor: "#FFEDD5",
        color: "#000",
        fontWeight: "600",
        fontSize: "13px",
        textTransform: "uppercase",
        fontFamily: "Oswald, sans-serif",
        borderRadius: "6px",
      },
    },
    rows: {
      style: {
        fontWeight: "500",
        color: "#000",
        fontFamily: "Oswald, sans-serif",
      },
    },
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    total: tickets.length,
  };

  // ✅ Typed columns
  const columns: TableColumn<Ticket>[] = [
    {
      name: "Ticket",
      selector: (row) => row.id,
      sortable: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{row.id}</span>
            {row.responses > 0 && (
              <span className="text-xs border rounded px-2 py-0.5">
                {row.responses} replies
              </span>
            )}
          </div>
          <p className="font-medium text-sm max-w-xs truncate">{row.title}</p>
        </div>
      ),
    },
    {
      name: "Customer",
      selector: (row) => row.customer,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span>{row.customer}</span>
        </div>
      ),
    },
    {
      name: "Priority",
      selector: (row) => row.priority,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(
            row.priority
          )}`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => {
        const StatusIcon = getStatusIcon(row.status);
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <span
              className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                row.status
              )}`}
            >
              {row.status.replace("-", " ")}
            </span>
          </div>
        );
      },
    },
    {
      name: "Agent",
      selector: (row) => row.agent,
      cell: (row) =>
        row.agent !== "Unassigned" ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
              {row.agent
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span>{row.agent}</span>
          </div>
        ) : (
          <span className="text-xs border rounded px-2 py-0.5">Unassigned</span>
        ),
    },
    {
      name: "Activity",
      selector: (row) => row.created,
      cell: (row) => (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {row.created}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {row.lastActivity}
          </div>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <button className="p-2 border rounded hover:bg-gray-100">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 border rounded hover:bg-gray-100">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
      right: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">
            Manage customer support tickets and requests
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ title: "Open", count: stats.open, icon: AlertCircle },
          { title: "In Progress", count: stats.inProgress, icon: Clock },
          { title: "Resolved", count: stats.resolved, icon: CheckCircle },
          { title: "Total", count: stats.total, icon: MessageSquare },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="p-4 bg-white rounded-[10px] border shadow-sm flex items-center gap-3 hover:shadow-md transition">
              <div className="p-2 bg-orange-100 rounded-lg">
                <stat.icon className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.count}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-6 bg-white rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search tickets by title, customer, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="p-6 bg-white rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-lg">All Tickets</h2>
          <span className="ml-2 text-sm text-gray-500">
            {filteredTickets.length} of {tickets.length}
          </span>
        </div>

        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredTickets}
            pagination
            paginationPerPage={10}
            persistTableHead
            customStyles={customStyles}
            responsive
          />
        </div>
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No tickets found matching your criteria.
            </p>
            <button
              className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
