"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
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
  AreaChart,
} from "recharts"
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
  MoreVertical,
} from "lucide-react"
import MonthCalendar from "../components/dashboard/MonthCalendar"

type Stat = {
  title: string
  value: string
  change: string
  changeValue: number
  icon: any
  trend: "up" | "down"
}

type Todo = {
  id: string
  label: string
  done: boolean
  priority: "high" | "medium" | "low"
  time: string
}

type ActivityType = "lead" | "task" | "support"

type ActivityItemType = {
  id: number
  action: string
  user: string
  time: string
  type: ActivityType
}

const mockLeadsData = [
  { month: "Jan", leads: 45, conversions: 12 },
  { month: "Feb", leads: 52, conversions: 15 },
  { month: "Mar", leads: 48, conversions: 18 },
  { month: "Apr", leads: 61, conversions: 22 },
  { month: "May", leads: 55, conversions: 19 },
  { month: "Jun", leads: 67, conversions: 25 },
]

const leadsStageData = [
  { name: "New", value: 35 },
  { name: "Contacted", value: 22 },
  { name: "Qualified", value: 18 },
  { name: "Proposal", value: 14 },
  { name: "Won", value: 8 },
  { name: "Lost", value: 3 },
]

const stats: Stat[] = [
  {
    title: "Total Leads",
    value: "1,234",
    change: "+12.5%",
    changeValue: 135,
    icon: Users,
    trend: "up",
  },
  {
    title: "Active Tasks",
    value: "89",
    change: "+5.2%",
    changeValue: 4,
    icon: CheckSquare,
    trend: "up",
  },
  {
    title: "Staff Online",
    value: "24",
    change: "+8.3%",
    changeValue: 2,
    icon: UserCheck,
    trend: "up",
  },
  {
    title: "Support Tickets",
    value: "156",
    change: "-8.1%",
    changeValue: -14,
    icon: Headphones,
    trend: "down",
  },
]

const todoItems: Todo[] = [
  { id: "td1", label: "Follow up with new leads", done: false, priority: "high", time: "2 hours ago" },
  { id: "td2", label: "Prepare proposal for ACME", done: false, priority: "medium", time: "4 hours ago" },
  { id: "td3", label: "Review ticket #4231", done: true, priority: "low", time: "1 day ago" },
]

const recentActivities: ActivityItemType[] = [
  { id: 1, action: "New lead created", user: "John Doe", time: "2 min ago", type: "lead" },
  { id: 2, action: "Task completed", user: "Sarah Smith", time: "15 min ago", type: "task" },
  { id: 3, action: "Support ticket resolved", user: "Mike Johnson", time: "1 hour ago", type: "support" },
]

const ChartCard = ({
  title,
  children,
  icon: Icon,
  delay = 0,
}: { title: string; children: React.ReactNode; icon: any; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
  >
    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
)

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-blue-600 shadow-sm">
        <stat.icon className="h-6 w-6 text-white" />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${stat.trend === "up" ? "bg-blue-50 border-blue-200" : "bg-gray-100 border-gray-200"}`}>
        {stat.trend === "up" ? (
          <ArrowUp className="h-3 w-3 text-blue-600" />
        ) : (
          <ArrowDown className="h-3 w-3 text-gray-500" />
        )}
        <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-blue-700" : "text-gray-600"}`}>
          {stat.change}
        </span>
      </div>
    </div>

    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
    </div>
  </motion.div>
)

const TodoItem = ({ item, index }: { item: Todo; index: number }) => {
  const [completed, setCompleted] = useState(item.done)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
        completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCompleted(!completed)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
          completed ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"
        }`}
      >
        {completed && <CheckCircle2 className="w-3 h-3 text-white mx-auto" />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
          {item.label}
        </p>
        <span className="text-xs text-gray-500">{item.time}</span>
      </div>
    </motion.div>
  )
}

const ActivityRow = ({ activity, index }: { activity: ActivityItemType; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
  >
    <div className="p-2 rounded-lg border bg-blue-50 border-blue-200">
      <div className="bg-blue-600 p-1 rounded">
        {activity.type === "lead" && <Users className="h-4 w-4 text-white" />}
        {activity.type === "task" && <CheckSquare className="h-4 w-4 text-white" />}
        {activity.type === "support" && <Headphones className="h-4 w-4 text-white" />}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
      <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
    </div>
  </motion.div>
)

export default function Dashboard() {
  return (
    <div className="min-h-screen  pl-3 md:pl-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl mb-8 p-8 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Welcome back! 
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gray-600 text-lg"
            >
              Here's what's happening with your business today.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <motion.button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100">
              <Plus className="h-4 w-4" />
              Add Lead
            </motion.button>
            <motion.button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100">
              <CheckSquare className="h-4 w-4" />
              New Task
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <ChartCard title="Leads Growth & Conversions" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockLeadsData}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" stroke="#3B82F6" fill="url(#leadsGradient)" name="Leads" />
                <Area type="monotone" dataKey="conversions" stroke="#6B7280" fillOpacity={0.1} name="Conversions" />
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
                <Pie data={leadsStageData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                  {leadsStageData.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? "#3B82F6" : "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
