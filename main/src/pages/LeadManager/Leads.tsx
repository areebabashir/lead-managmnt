import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Eye, Edit, Trash2 } from "lucide-react";

const transactionData = [
  {
    id: "LD-1001",
    date: "bassel.idris@example.com", // Contact Info (Email)
    client: "New", // Status
    invoice: "High", // Priority
    activity: "$5,000", // Value
    currency: "28/05/2025", // Last Contact
  },
  {
    id: "LD-1002",
    date: "said.tannir@example.com",
    client: "Contacted",
    invoice: "Medium",
    activity: "$2,500",
    currency: "30/05/2025",
  },
  {
    id: "LD-1003",
    date: "john@example.com",
    client: "Qualified",
    invoice: "Low",
    activity: "$1,200",
    currency: "01/06/2025",
  },
  {
    id: "LD-1004",
    date: "maya@example.com",
    client: "Proposal",
    invoice: "High",
    activity: "$8,700",
    currency: "02/06/2025",
  },
  {
    id: "LD-1005",
    date: "khan@example.com",
    client: "Lost",
    invoice: "Low",
    activity: "$500",
    currency: "01/06/2025",
  },
];

const LeadManagerLeads: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState("");
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

  const filteredData = transactionData.filter((row) => {
    const matchesSearch = row.id
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesSearch;
  });

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
          name: "Status",
          selector: (row: any) => row.client,
          center: true,
        },
        {
          name: "Priority",
          selector: (row: any) => row.invoice,
          center: true,
        },
        {
          name: "Value",
          selector: (row: any) => row.activity,
          center: true,
        },
      ]
    : [
        {
          name: "Lead Details",
          selector: (row: any) => row.id,
          sortable: true,
          width: "156px",
          center: true,
        },
        {
          name: "Contact Info",
          selector: (row: any) => row.date, // Email
          width: "200px",
          center: true,
        },
        { name: "Status", selector: (row: any) => row.client, center: true },
        { name: "Priority", selector: (row: any) => row.invoice, center: true },
        { name: "Value", selector: (row: any) => row.activity, center: true },
        {
          name: "Last Contact",
          selector: (row: any) => row.currency,
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
          <h2 className="text-2xl font-bold text-black">Leads Management</h2>
          <p className="text-sm text-gray-800">Track and manage all your leads</p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2.5 rounded-md text-base font-semibold ">
          Add New Lead
        </button>
      </div>

      {/* Filters Section (Outside Card) */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
        />

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:orange-100 outline-none"
        >
          <option value="">Select Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Lost">Lost</option>
        </select>

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

export default LeadManagerLeads;
