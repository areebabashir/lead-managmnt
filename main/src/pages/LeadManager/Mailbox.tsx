import React, { useState } from "react";
import DataTable from "react-data-table-component";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
} from "lucide-react";

// ✅ Dummy data
const transactionData = [
  {
    id: "LD-1001",
    date: "bassel.idris@example.com",
    client: "New",
    invoice: "High",
    activity: "$5,000",
    currency: "28/05/2025",
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

// ✅ Mobile check
const isMobile = window.innerWidth < 768;

// ✅ Columns
const columns = isMobile
  ? [
      { name: "ID", selector: (row: any) => row.id, sortable: true, width: "80px", center: true },
      { name: "Label", selector: (row: any) => row.client, center: true },
      { name: "Time", selector: (row: any) => row.invoice, center: true },
      { name: "Value", selector: (row: any) => row.activity, center: true },
    ]
  : [
      { name: "From", selector: (row: any) => row.id, sortable: true, width: "156px", center: true },
      { name: "Subject", selector: (row: any) => row.date, width: "200px", center: true },
      { name: "Label", selector: (row: any) => row.client, center: true },
      { name: "Time", selector: (row: any) => row.invoice, center: true },
      {
        name: "Action",
        cell: (row: any) => (
          <div className="flex justify-center gap-2">
            <button className="text-gray-600"><Eye size={18} /></button>
            <button className="text-orange-500"><Edit size={18} /></button>
            <button className="text-red-600"><Trash2 size={18} /></button>
          </div>
        ),
        center: true,
        width: "150px",
      },
    ];

// ✅ Custom styles
const customStyles = {
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
  rows: { style: { fontWeight: "500", color: "#000", fontFamily: "Oswald, sans-serif" } },
};

export default function LeadManagerMailbox() {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Emails");

  // ✅ Filtered data for search + dropdown
  const filteredData = transactionData.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchText.toLowerCase()) ||
      item.date.toLowerCase().includes(searchText.toLowerCase()) ||
      item.client.toLowerCase().includes(searchText.toLowerCase()) ||
      item.invoice.toLowerCase().includes(searchText.toLowerCase()) ||
      item.activity.toLowerCase().includes(searchText.toLowerCase()) ||
      item.currency.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "All Emails" || item.client === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ✅ Export CSV
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Contact,Status,Priority,Value,Last Contact"]
        .concat(
          transactionData.map(
            (row) =>
              `${row.id},${row.date},${row.client},${row.invoice},${row.activity},${row.currency}`
          )
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "mailbox_data.csv";
    link.click();
  };

  return (
    <div className="p-6">
      {/* ✅ Mailbox Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        {/* Compose Button */}
        <button className="flex items-center font-semibold gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-[10px] shadow">
          <Plus size={18} /> Compose
        </button>

        {/* Search Bar + Dropdown + Export */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-[10px] text-sm focus:ring-2 focus:ring-orange-200"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-[10px] bg-white text-sm"
          >
            <option>All Emails</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Proposal</option>
            <option>Lost</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 border rounded-[10px] bg-white hover:bg-gray-50 text-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* ✅ Table Card */}
      <div className="p-4 sm:p-5 shadow-md border border-gray-200 rounded-lg bg-white">
        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={isMobile ? 5 : 10}
            persistTableHead
            selectableRows
            onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
            clearSelectedRows={toggleCleared}
            customStyles={customStyles}
            responsive
          />
        </div>
      </div>
    </div>
  );
}
