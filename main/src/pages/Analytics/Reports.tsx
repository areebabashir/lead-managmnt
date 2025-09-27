import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Download, Filter, Users, Target, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ReportFilters {
  dateRange: string;
  source: string;
  status: string;
}

const Reports: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: '30days',
    source: 'all',
    status: 'all'
  });

 {/* const [activeTab, setActiveTab] = useState('overview'); */}

  // Chart data configurations
  const leadTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Leads',
        data: [120, 145, 180, 165, 220, 195],
        borderColor: '#F97316', // orange-500
        backgroundColor: 'rgba(251, 146, 60, 0.1)', // orange-400/10
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Conversions',
        data: [24, 31, 42, 38, 55, 47],
        borderColor: '#FB923C', // orange-400
        backgroundColor: 'rgba(253, 186, 116, 0.1)', // orange-300/10
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#FB923C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const monthlyPerformanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Leads',
        data: [120, 145, 180, 165, 220, 195],
        backgroundColor: 'rgba(253, 186, 116, 0.8)', // orange-300/80
        borderColor: '#FB923C', // orange-400
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Conversions',
        data: [24, 31, 42, 38, 55, 47],
        backgroundColor: 'rgba(251, 146, 60, 0.8)', // orange-400/80
        borderColor: '#F97316', // orange-500
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const leadSourcesData = {
    labels: ['Website', 'Social Media', 'Email Campaign', 'Referral'],
    datasets: [
      {
        data: [35, 28, 22, 15],
        backgroundColor: [
          '#F97316', // orange-500
          '#FB923C', // orange-400
          '#FDBA74', // orange-300
          '#FED7AA'  // orange-200
        ],
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 4,
      }
    ]
  };

  const conversionFunnelData = {
    labels: ['Total Leads', 'Qualified', 'Proposals', 'Closed'],
    datasets: [
      {
        data: [1200, 720, 360, 180],
        backgroundColor: [
          'rgba(249, 115, 22, 0.9)', // orange-500
          'rgba(251, 146, 60, 0.9)', // orange-400
          'rgba(253, 186, 116, 0.9)', // orange-300
          'rgba(254, 215, 170, 0.9)' // orange-200
        ],
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1F2937',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      }
    }
  };

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const, // 👈 yahan "right" ki jagah "bottom"
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1F2937',
      bodyColor: '#6B7280',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function (context: any) {
          return `${context.label}: ${context.parsed}%`;
        },
      },
    },
  },
};

  const topPerformers = [
    { name: 'Sarah Chen', leads: 45, conversions: 12, rate: '26.7%', trend: 'up', avatar: 'SC' },
    { name: 'Mike Johnson', leads: 38, conversions: 9, rate: '23.7%', trend: 'up', avatar: 'MJ' },
    { name: 'Emily Davis', leads: 42, conversions: 8, rate: '19.0%', trend: 'down', avatar: 'ED' }
   
  ];

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen ">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                Lead Analytics Dashboard
              </h1>
              <p className="text-gray-700 font-medium">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
             {/* <button className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-orange-700 px-5 py-3 rounded-xl hover:bg-white transition-all shadow-lg border border-orange-200">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button> */}
              <button className="flex items-center gap-2 font-semibold bg-primary text-white px-6 py-3 cursor-pointer rounded-[10px] transition-all shadow-lg">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Enhanced Tabs */}
         {/* <div className="flex space-x-2 w-fit backdrop-blur-sm p-2 rounded-xl border border-gray-200">
            {['overview', 'performance', 'sources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white '
                    : 'text-primary  hover:bg-white/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div> */}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl  border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl ">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-black">Filter & Analyze</h3>
                <p className="text-sm text-gray-700">Customize your data view</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4" />
              Last updated: 2 minutes ago
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Time Period</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500  text-gray-700 font-medium"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Lead Source</label>
              <select 
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 font-medium"
              >
                <option value="all">All Sources</option>
                <option value="website">Website</option>
                <option value="social">Social Media</option>
                <option value="email">Email Campaign</option>
                <option value="referral">Referral</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className=" backdrop-blur-sm p-6 rounded-xl border border-gray-200 ">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl ">
                <Users className="w-6 h-6 text-black" />
              </div>
             {/* <button className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-orange-600" />
              </button> */}
            </div>
            <div>
              <p className="text-sm font-semibold text-black mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-black mb-2">1,247</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 text-primary" />
                  <span className="text-xs font-semibold text-primary">+12.5%</span>
                </div>
                <span className="text-sm text-gray-700">vs last month</span>
              </div>
            </div>
          </div>

          <div className=" backdrop-blur-sm p-6 rounded-xl border border-gray-200 ">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl ">
                <Target className="w-6 h-6 text-black" />
              </div>
              {/*<button className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-orange-600" />
              </button> */}
            </div>
            <div>
              <p className="text-sm font-semibold text-black mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-black mb-2">18.5%</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-500">+2.3%</span>
                </div>
                <span className="text-sm text-gray-700">vs last month</span>
              </div>
            </div>
          </div>

          <div className=" backdrop-blur-sm p-6 rounded-xl border border-gray-200 ">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl ">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              
            </div>
            <div>
              <p className="text-sm font-semibold text-black mb-1">Revenue Generated</p>
              <p className="text-3xl font-bold text-black mb-2">$89.2K</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-500">+8.7%</span>
                </div>
                <span className="text-sm text-gray-700">vs last month</span>
              </div>
            </div>
          </div>

          <div className=" backdrop-blur-sm p-6 rounded-xl border border-gray-200 ">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl ">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              
            </div>
            <div>
              <p className="text-sm font-semibold text-black mb-1">Avg. Deal Size</p>
              <p className="text-3xl font-bold text-black mb-2">$4.85K</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
                  <ArrowDownRight className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-500">-3.2%</span>
                </div>
                <span className="text-sm text-gray-700">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Lead Trends Chart - Takes 2 columns */}
          <div className="xl:col-span-2  backdrop-blur-sm p-6 rounded-xl  border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-black">Lead Performance Trends</h3>
                <p className="text-sm text-gray-700">Monthly leads and conversion tracking</p>
              </div>
            </div>
            <div className="h-80">
              <Line data={leadTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Lead Sources */}
          <div className=" backdrop-blur-sm p-6 rounded-xl  border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-6">Lead Sources</h3>
            <div className="h-64">
              <Pie data={leadSourcesData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className=" backdrop-blur-sm p-6 rounded-xl  border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-6">Conversion Funnel</h3>
            <div className="h-64">
              <Doughnut data={conversionFunnelData} options={pieOptions} />
            </div>
          </div>

          {/* Top Performers */}
         {/* <div className=" backdrop-blur-sm p-6 rounded-xl  border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Top Performers</h3>
              <button className="text-sm text-white hover font-semibold px-3 py-1.5 bg-orange-500 rounded-[10px]  transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-4  rounded-xl transition-colors border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm ">
                      {performer.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-black">{performer.name}</p>
                      <p className="text-sm text-gray-700">{performer.leads} leads • {performer.conversions} conversions</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className="font-bold text-gray-700">{performer.rate}</span>
                    <div className={`p-1.5 rounded-lg ${performer.trend === 'up' ? 'bg-orange-100' : 'bg-orange-100'}`}>
                      {performer.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-orange-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Monthly Performance Bar Chart */}
          <div className="lg:col-span-1 backdrop-blur-sm p-6 rounded-xl  border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-black">Monthly Performance</h3>
                <p className="text-sm text-gray-700">Comparative analysis of leads vs conversions</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={monthlyPerformanceData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;