import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  CheckSquare,
  UserCheck,
  Headphones,
  TrendingUp,
  Plus,
  ListTodo,
  CalendarDays,
  PieChart,
  CheckCircle2,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';
import MonthCalendar from '../components/dashboard/MonthCalendar';

type Stat = {
  title: string;
  value: string;
  change: string;
  changeValue: number;
  icon: any;
  gradient: string;
  bgGradient: string;
  trend: 'up' | 'down';
};

type Todo = {
  id: string;
  label: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
  time: string;
};

type ActivityType = 'lead' | 'task' | 'support';

type ActivityItemType = {
  id: number;
  action: string;
  user: string;
  time: string;
  type: ActivityType;
};

const mockLeadsData = [
  { month: 'Jan', leads: 45, conversions: 12 },
  { month: 'Feb', leads: 52, conversions: 15 },
  { month: 'Mar', leads: 48, conversions: 18 },
  { month: 'Apr', leads: 61, conversions: 22 },
  { month: 'May', leads: 55, conversions: 19 },
  { month: 'Jun', leads: 67, conversions: 25 }
];

const leadsStageData = [
  { name: 'New', value: 35, color: '#3B82F6' },
  { name: 'Contacted', value: 22, color: '#8B5CF6' },
  { name: 'Qualified', value: 18, color: '#10B981' },
  { name: 'Proposal', value: 14, color: '#F59E0B' },
  { name: 'Won', value: 8, color: '#EF4444' },
  { name: 'Lost', value: 3, color: '#6B7280' }
];

// Removed paymentsReceivables dataset as per request

const stats: Stat[] = [
  {
    title: 'Total Leads',
    value: '1,234',
    change: '+12.5%',
    changeValue: 135,
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    trend: 'up'
  },
  {
    title: 'Active Tasks',
    value: '89',
    change: '+5.2%',
    changeValue: 4,
    icon: CheckSquare,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    trend: 'up'
  },
  {
    title: 'Staff Online',
    value: '24',
    change: '+8.3%',
    changeValue: 2,
    icon: UserCheck,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    trend: 'up'
  },
  {
    title: 'Support Tickets',
    value: '156',
    change: '-8.1%',
    changeValue: -14,
    icon: Headphones,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    trend: 'down'
  }
];

const todoItems: Todo[] = [
  { id: 'td1', label: 'Follow up with new leads', done: false, priority: 'high', time: '2 hours ago' },
  { id: 'td2', label: 'Prepare proposal for ACME', done: false, priority: 'medium', time: '4 hours ago' },
  { id: 'td3', label: 'Review ticket #4231', done: true, priority: 'low', time: '1 day ago' },
  { id: 'td4', label: 'Schedule onboarding session', done: false, priority: 'high', time: '3 hours ago' },
  { id: 'td5', label: 'Update client database', done: false, priority: 'medium', time: '5 hours ago' }
];

const recentActivities: ActivityItemType[] = [
  { id: 1, action: 'New lead created', user: 'John Doe', time: '2 min ago', type: 'lead' },
  { id: 2, action: 'Task completed', user: 'Sarah Smith', time: '15 min ago', type: 'task' },
  { id: 3, action: 'Support ticket resolved', user: 'Mike Johnson', time: '1 hour ago', type: 'support' }
];

const ChartCard = ({ title, children, icon: Icon, delay = 0 }: { title: string; children: React.ReactNode; icon: any; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    className="group relative overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full translate-x-8 -translate-y-8`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
          {stat.trend === 'up' ? (
            <ArrowUp className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
        <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
        <p className="text-xs text-gray-500">{stat.trend === 'up' ? '+' : ''}{stat.changeValue} from last month</p>
      </div>

      <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ duration: 1.5, delay: index * 0.2 }}
          className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
        />
      </div>
    </div>
  </motion.div>
);

const TodoItem = ({ item, index }: { item: Todo; index: number }) => {
  const [completed, setCompleted] = useState(item.done);

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
        completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCompleted(!completed)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-300 ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        {completed && <CheckCircle2 className="w-3 h-3 text-white mx-auto" />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-all duration-300 ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[item.priority]}`}>{item.priority}</span>
          <span className="text-xs text-gray-500">{item.time}</span>
        </div>
      </div>
    </motion.div>
  );
};

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'lead':
      return <Users className="h-4 w-4" />;
    case 'task':
      return <CheckSquare className="h-4 w-4" />;
    case 'support':
      return <Headphones className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case 'lead':
      return 'from-blue-500 to-cyan-500';
    case 'task':
      return 'from-green-500 to-emerald-500';
    case 'support':
      return 'from-orange-500 to-red-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const ActivityRow = ({ activity, index }: { activity: ActivityItemType; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
      <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
    </div>
  </motion.div>
);


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pl-3 md:pl-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl mb-8 h-64">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce" />
        <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-pulse" />

        <div className="relative z-10 flex items-center justify-between h-full p-8">
          <div className="text-white">
            <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-bold mb-2">Welcome back! 👋</motion.h1>
            <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-white/90 text-lg">Here's what's happening with your business today.</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">All systems operational</span>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 text-white rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              <Plus className="h-4 w-4" />
              Add Lead
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 text-white rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
              <CheckSquare className="h-4 w-4" />
              New Task
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-900 rounded-xl hover:bg-white transition-all duration-300 font-medium">
              <Headphones className="h-4 w-4" />
              Support
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 p-1 md:p-0">
        <div className="xl:col-span-2 space-y-8">
          <ChartCard title="Leads Growth & Conversions" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={mockLeadsData}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={3} fill="url(#leadsGradient)" name="Total Leads" />
                <Area type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={3} fill="url(#conversionsGradient)" name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Calendar & Schedule" icon={CalendarDays}>
            <MonthCalendar />
          </ChartCard>
        </div>

        <div className="space-y-6">

          <ChartCard title="My Tasks" icon={ListTodo}>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todoItems.map((item, index) => (
                <TodoItem key={item.id} item={item} index={index} />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-all duration-300">
              <Plus className="h-4 w-4 mx-auto" />
            </motion.button>
          </ChartCard>

          <ChartCard title="Recent Activity" icon={Clock}>
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <ActivityRow key={activity.id} activity={activity} index={index} />
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Leads Distribution" icon={PieChart}>
            <ResponsiveContainer width="100%" height={240}>
              <RechartsPieChart>
                <Pie data={leadsStageData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value">
                  {leadsStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {leadsStageData.map((stage, index) => (
                <motion.div key={stage.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stage.value}</span>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}


