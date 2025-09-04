import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  Eye,
  Edit,
  Trash2,
  Shield,
  Users,
  ClipboardList,
  Settings,
  LineChart,
  MessageSquare,
  Headphones,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // ✅ adjust import path as per your setup
import { Button } from "@/components/ui/button"; // ✅ adjust import path

const DataTableExample = () => {
  const [filterText, setFilterText] = useState("");

  const roles: any[] = []; // ✅ dummy placeholder
  const totalUsers = 0; // ✅ dummy placeholder

  const columns = [
    {
      name: "ROLE",
      selector: (row: any) => row.role,
      sortable: true,
      center: true,
    },
    {
      name: "DESCRIPTION",
      selector: (row: any) => row.description,
      sortable: true,
      center: true,
    },
    {
      name: "USERS",
      selector: (row: any) => row.users,
      sortable: true,
      center: true,
    },
    {
      name: "PERMISSIONS",
      selector: (row: any) => row.permissions,
      sortable: true,
      center: true,
    },
    {
      name: "ACTION",
      cell: () => (
        <div className="flex gap-2 justify-center px-2">
          <Eye className="w-4 h-4 text-gray-600 cursor-pointer" />
          <Edit className="w-4 h-4 text-orange-500 cursor-pointer" />
          <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
        </div>
      ),
      center: true,
    },
  ];

  const data = [
    {
      role: "Admin",
      description: "Full access to all features",
      users: 5,
      permissions: 12,
    },
    {
      role: "Manager",
      description: "Manage leads and team",
      users: 8,
      permissions: 8,
    },
    {
      role: "Support",
      description: "Handle support tickets",
      users: 3,
      permissions: 6,
    },
    {
      role: "Sales",
      description: "Access to sales module",
      users: 10,
      permissions: 7,
    },
    {
      role: "Viewer",
      description: "Read-only access",
      users: 12,
      permissions: 3,
    },
  ];

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#FFFFFF",
      },
    },
    rows: {
      style: {
        backgroundColor: "#FFFFFF",
        minHeight: "45px", // thoda chota height
      },
      highlightOnHoverStyle: {
        backgroundColor: "#FFFFFF",
        transitionDuration: "0.2s",
        outline: "none",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#FFEDD5",
        color: "#000000",
        fontSize: "13px",
        fontWeight: "600",
        justifyContent: "center",
        padding: "6px", // thoda sa px
      },
    },
    cells: {
      style: {
        justifyContent: "center",
        fontSize: "12px",
        color: "#000000",
        padding: "6px", // thoda sa px
      },
    },
  };

  return (
    <div className="space-y-6 px-5 pt-5">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and access permissions
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1">
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {roles.filter((r) => !r.isSystem).length}
                </p>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <div className="p-3 shadow-md rounded-lg bg-white px-2">
        <DataTable
          columns={columns}
          data={filteredData}
          customStyles={customStyles}
          pagination
        />
      </div>

      {/* Permission Categories */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-orange-50 rounded-t-lg py-2 px-3">
          <CardTitle className="text-xl">Permission Categories</CardTitle>
          <p className="text-sm text-gray-500">
            Available permission groups across the system
          </p>
        </CardHeader>
        <CardContent className="pt-4 px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
            {[
              {
                name: "Lead Management",
                permissions: 8,
                description: "Create, edit, assign leads",
                icon: <ClipboardList className="h-5 w-5 text-black" />,
              },
              {
                name: "User Management",
                permissions: 6,
                description: "Manage team members",
                icon: <Users className="h-5 w-5 text-black" />,
              },
              {
                name: "System Settings",
                permissions: 12,
                description: "Configure system options",
                icon: <Settings className="h-5 w-5 text-black" />,
              },
              {
                name: "Reports & Analytics",
                permissions: 5,
                description: "View performance data",
                icon: <LineChart className="h-5 w-5 text-black" />,
              },
              {
                name: "Communication",
                permissions: 4,
                description: "SMS, email, chat features",
                icon: <MessageSquare className="h-5 w-5 text-black" />,
              },
              {
                name: "Support Features",
                permissions: 7,
                description: "Tickets, knowledge base",
                icon: <Headphones className="h-5 w-5 text-black" />,
              },
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow cursor-pointer hover:border-orange-100"
              >
                <div className="flex items-start gap-2">
                  {category.icon}
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {category.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                    <div className="flex items-center mt-2">
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
};

export default DataTableExample;
