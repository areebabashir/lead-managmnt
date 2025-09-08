import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DataTable, { TableStyles } from "react-data-table-component";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock data for the charts
const monthlyPerformanceData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Leads",
      data: [120, 145, 180, 165, 220, 195],
      backgroundColor: "rgba(253, 186, 116, 0.8)", // orange-300/80
      borderColor: "#FB923C", // orange-400
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
    },
    {
      label: "Conversions",
      data: [24, 31, 42, 38, 55, 47],
      backgroundColor: "rgba(251, 146, 60, 0.8)", // orange-400/80
      borderColor: "#F97316", // orange-500
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // allow full width/height
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "#374151", // gray-700
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: { color: "#6B7280" },
      grid: { color: "#E5E7EB" },
    },
    y: {
      ticks: { color: "#6B7280" },
      grid: { color: "#E5E7EB" },
    },
  },
};

// Team Performance Data
const teamPerformance = [
  { name: "John Doe", leads: 245, conversion: 68, revenue: "$12,400" },
  { name: "Jane Smith", leads: 198, conversion: 72, revenue: "$11,800" },
  { name: "Robert Johnson", leads: 176, conversion: 65, revenue: "$9,750" },
  { name: "Sarah Williams", leads: 220, conversion: 75, revenue: "$13,200" },
  { name: "Michael Brown", leads: 190, conversion: 70, revenue: "$10,900" },
];

// ✅ DataTable Columns
const columns = [
  {
    name: "Team Member",
    selector: (row: any) => row.name,
    sortable: true,
  },
  {
    name: "Leads",
    selector: (row: any) => row.leads,
    sortable: true,
  },
  {
    name: "Conversion Rate",
    selector: (row: any) => `${row.conversion}%`,
    sortable: true,
  },
  {
    name: "Revenue",
    selector: (row: any) => row.revenue,
    sortable: true,
  },
  {
    name: "Actions",
    cell: () => (
      <button className="text-orange-500  text-sm font-medium">
        View Details
      </button>
    ),
  },
];

// ✅ Custom Styles for DataTable
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

const Performance = () => {
  const [timeRange, setTimeRange] = useState("monthly");

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Performance Analytics</h1>
       <div>
  <select
    value={timeRange}
    onChange={(e) => setTimeRange(e.target.value)}
    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
  >
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
  </select>
</div>

      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-black text-sm font-medium mb-2">Total Leads</h3>
          <p className="text-3xl font-bold text-black">2,347</p>
          <p className="text-orange-500 text-sm mt-1">↑ 12.5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-black text-sm font-medium mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold text-black">24.8%</p>
          <p className="text-orange-500 text-sm mt-1">↑ 3.2% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-black text-sm font-medium mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-black">$58,240</p>
          <p className="text-orange-500 text-sm mt-1">↑ 8.7% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-black text-sm font-medium mb-2">Avg. Response Time</h3>
          <p className="text-3xl font-bold text-black">2.4h</p>
          <p className="text-orange-500 text-sm mt-1">↑ 0.3h from last month</p>
        </div>
      </div>

      {/* Monthly Performance Graph */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Monthly Performance</h2>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-[10px] text-base">
            Export Report
          </button>
        </div>
        <div className="h-96 w-full">
          <Bar data={monthlyPerformanceData} options={chartOptions} />
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="p-4 sm:p-5 shadow-md border border-gray-200 rounded-[10px] bg-white">
        <h2 className="text-xl font-bold text-black mb-4">
          Team Performance
        </h2>
        <div className="mt-2 overflow-x-auto">
          <DataTable
            columns={columns}
            data={teamPerformance}
            pagination
            paginationPerPage={10}
            persistTableHead
            selectableRows
            customStyles={customStyles}
            responsive
          />
        </div>
      </div>
    </div>
  );
};

export default Performance;
