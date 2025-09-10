import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Edit,
  Users,
  Trash2,
  ClipboardList,
  Settings,
  LineChart,
  MessageSquare,
  Headphones,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddRoleModal } from "@/components/forms/AddRoleModal";
import { Button } from "@/components/ui/button";
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";

const mockRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access",
    users: 2,
    permissions: ["All Permissions"],
    isSystem: true,
  },
  {
    id: 2,
    name: "Manager",
    description: "Team management",
    users: 5,
    permissions: ["Lead Management", "Team Management"],
    isSystem: false,
  },
  {
    id: 3,
    name: "Sales Agent",
    description: "Lead handling",
    users: 15,
    permissions: ["View Leads", "Update Leads"],
    isSystem: false,
  },
  {
    id: 4,
    name: "Support Agent",
    description: "Customer support",
    users: 8,
    permissions: ["View Tickets", "Update Tickets"],
    isSystem: false,
  },
  {
    id: 5,
    name: "Viewer",
    description: "Read-only access",
    users: 3,
    permissions: ["View Reports", "View Analytics"],
    isSystem: false,
  },
];

export default function SupportRoles() {
  const [roles, setRoles] = useState(mockRoles);

  const handleDeleteRole = (roleId: number) => {
    setRoles(roles.filter((role) => role.id !== roleId));
  };

  const totalUsers = roles.reduce((sum, role) => sum + role.users, 0);

  const columns: TableColumn<(typeof roles)[0]>[] = [
    {
      name: <div className="text-center text-black text-[13px] font-semibold">Role</div>,
      selector: (row) => row.name,
      cell: (row) => (
        <div className="text-center font-medium">{row.name}</div>
      ),
      center: true,
    },
    {
      name: <div className="text-center text-black text-[13px] font-semibold">Description</div>,
      selector: (row) => row.description,
      cell: (row) => <div className="text-center">{row.description}</div>,
      center: true,
    },
    {
      name: <div className="text-center text-black text-[13px] font-semibold">Users</div>,
      selector: (row) => row.users.toString(),
      cell: (row) => <div className="text-center">{row.users}</div>,
      center: true,
    },
    {
      name: <div className="text-center text-black text-[13px] font-semibold">Permissions</div>,
      selector: (row) => row.permissions.join(", "),
      cell: (row) => (
        <div className="text-center">{row.permissions.join(", ")}</div>
      ),
      center: true,
    },
    {
      name: <div className="text-center text-black text-[13px] font-semibold">Actions</div>,
      cell: (row) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="sm" className="text-orange-500">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => handleDeleteRole(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      center: true,
    },
  ];

  // ✅ Fix: Properly typed customStyles (removed duplicate "cells" block)
  const customStyles: TableStyles = {
    headCells: {
      style: {
        justifyContent: "center",
        color: "#000",
      },
    },
    cells: {
      style: {
        justifyContent: "center",
        textAlign: "center",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#FFEDD5", // orange-100
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

  return (
    <div className="space-y-6 px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access permissions
          </p>
        </div>
        <AddRoleModal
          trigger={
            <Button className="gap-2 shadow-sm font-semibold bg-orange-500 text-white">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {roles.filter((r) => !r.isSystem).length}
                </p>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-5 shadow-md border border-gray-200 rounded-[10px] bg-white">
        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={roles} // 🔹 using roles directly
            pagination
            paginationPerPage={10}
            persistTableHead
            selectableRows
            customStyles={customStyles}
            responsive
          />
        </div>
      </div>

      {/* Permission Categories */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-orange-50 rounded-t-lg">
          <CardTitle>Permission Categories</CardTitle>
          <p className="text-sm text-gray-500">
            Available permission groups across the system
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Lead Management",
                permissions: 8,
                description: "Create, edit, assign leads",
                icon: <ClipboardList className="h-6 w-6 text-black" />,
              },
              {
                name: "User Management",
                permissions: 6,
                description: "Manage team members",
                icon: <Users className="h-6 w-6 text-black" />,
              },
              {
                name: "System Settings",
                permissions: 12,
                description: "Configure system options",
                icon: <Settings className="h-6 w-6 text-black" />,
              },
              {
                name: "Reports & Analytics",
                permissions: 5,
                description: "View performance data",
                icon: <LineChart className="h-6 w-6 text-black" />,
              },
              {
                name: "Communication",
                permissions: 4,
                description: "SMS, email, chat features",
                icon: <MessageSquare className="h-6 w-6 text-black" />,
              },
              {
                name: "Support Features",
                permissions: 7,
                description: "Tickets, knowledge base",
                icon: <Headphones className="h-6 w-6 text-black" />,
              },
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow cursor-pointer hover:border-orange-100"
              >
                <div className="flex items-start gap-3">
                  {category.icon}
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {category.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                    <div className="flex items-center mt-3">
                      <div className="flex-1 h-1 bg-orange-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400"
                          style={{
                            width: `${Math.min(
                              100,
                              (category.permissions / 12) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {category.permissions}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
