import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Eye, Edit, Trash2 } from "lucide-react";

// Staff Data
const staffData = [
  {
    id: "ST-1001",
    name: "John Doe",
    role: "Admin",
    status: "Active",
    lastLogin: "28/05/2025 10:30 AM",
  },
  {
    id: "ST-1002",
    name: "Jane Smith",
    role: "Manager",
    status: "Active",
    lastLogin: "29/05/2025 03:15 PM",
  },
  {
    id: "ST-1003",
    name: "Ali Khan",
    role: "Staff",
    status: "Inactive",
    lastLogin: "25/05/2025 09:00 AM",
  },
  {
    id: "ST-1004",
    name: "Emily Brown",
    role: "Staff",
    status: "Active",
    lastLogin: "30/05/2025 11:45 AM",
  },
  {
    id: "ST-1005",
    name: "Michael Lee",
    role: "Manager",
    status: "Active",
    lastLogin: "01/06/2025 08:20 PM",
  },
];

const SetupStaff: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [exportType, setExportType] = useState("");

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const filteredData = staffData.filter((row) =>
    row.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Responsive columns
  const columns = isMobile
    ? [
        {
          name: "ID",
          selector: (row: any) => row.id,
          sortable: true,
          width: "80px",
          center: true,
        },
        {
          name: "Role",
          selector: (row: any) => row.role,
          center: true,
        },
        {
          name: "Status",
          selector: (row: any) => row.status,
          center: true,
        },
      ]
    : [
        {
          name: "Member",
          selector: (row: any) => row.name,
          sortable: true,
          width: "180px",
          center: true,
        },
        {
          name: "Role",
          selector: (row: any) => row.role,
          width: "160px",
          center: true,
        },
        { name: "Status", selector: (row: any) => row.status, center: true },
        {
          name: "Last Login",
          selector: (row: any) => row.lastLogin,
          center: true,
        },
        {
          name: "Action",
          cell: (row: any) => (
            <div className="flex justify-center gap-2">
              <button className="text-gray-600">
                <Eye size={18} />
              </button>
              <button className="text-orange-500 ">
                <Edit size={18} />
              </button>
              <button className="text-red-600 ">
                <Trash2 size={18} />
              </button>
            </div>
          ),
          center: true,
          width: "150px",
        },
      ];

  const customStyles = {
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
    <div className="px-4 sm:px-8 pt-10">
      {/* Header Section (Outside Card) */}
      <div className="flex justify-between items-center mb-2">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-black">Staff Management</h2>
          <p className="text-sm text-gray-800">
            Manage your team members and their permissions
          </p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2.5 rounded-md text-base font-semibold ">
          Add Staff
        </button>
      </div>

      {/* Filters Section (Outside Card) */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search Staff..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        />

        {/* Export Dropdown */}
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        >
          <option value="">Export</option>
          <option value="pdf">Export as PDF</option>
          <option value="excel">Export as Excel</option>
          <option value="csv">Export as CSV</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="p-4 sm:p-5 shadow-md border border-gray-200 rounded-lg bg-white">
        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={isMobile ? 5 : 10}
            persistTableHead
            selectableRows
            onSelectedRowsChange={({ selectedRows }) =>
              setSelectedRows(selectedRows)
            }
            clearSelectedRows={toggleCleared}
            customStyles={customStyles}
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default SetupStaff;
