"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import MonthCalendar from "../components/dashboard/MonthCalendar"
import GoogleCalendarAuth from "../components/forms/GoogleCalendarAuth"
import ActiveEmailAccountStatus from "../components/dashboard/ActiveEmailAccountStatus"
import { dashboardAPI, DashboardStats, LeadsChartData, LeadsStageData, RecentActivity } from "../services/dashboardAPI"
import { contactAPI } from "../services/contactAPI"

import {

  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
  ChevronLeft,
  ChevronRight,
  Phone,
  Target,
  Coffee,
  Mail,
  MessageSquare,
  HelpCircle,
  Shield,
  Settings,
  Building,
  Bell,
  Search,
  User,
  X,
  Menu,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react"

// Types
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







const colors = [
  "#FFEDD5", // orange-100
  "#FED7AA", // orange-200
  "#FDBA74", // orange-300
  "#FB923C", // orange-400
  "#F97316", // orange-500
];



// Mock Data
const mockLeadsData = [
  { month: "Jan", leads: 45, conversions: 12 },
  { month: "Feb", leads: 52, conversions: 15 },
  { month: "Mar", leads: 48, conversions: 18 },
  { month: "Apr", leads: 61, conversions: 22 },
  { month: "May", leads: 55, conversions: 19 },
  { month: "Jun", leads: 67, conversions: 25 },
]


// Generate real stats from dashboard data
const generateStats = (data: DashboardStats | null): Stat[] => {
  if (!data) {
    return [
      { title: "Total Leads", value: "Loading...", change: "", changeValue: 0, icon: Users, trend: "up" },
      { title: "Active Tasks", value: "Loading...", change: "", changeValue: 0, icon: CheckSquare, trend: "up" },
      { title: "Total Users", value: "Loading...", change: "", changeValue: 0, icon: UserCheck, trend: "up" },
      { title: "SMS Sent", value: "Loading...", change: "", changeValue: 0, icon: MessageSquare, trend: "up" },
    ]
  }

  return [
    {
      title: "Total Leads",
      value: data.totalLeads.toLocaleString(),
      change: data.leadsGrowth >= 0 ? `+${data.leadsGrowth}%` : `${data.leadsGrowth}%`,
      changeValue: data.leadsThisMonth,
      icon: Users,
      trend: data.leadsGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Active Tasks",
      value: data.totalTasks.toLocaleString(),
      change: data.tasksGrowth >= 0 ? `+${data.tasksGrowth}%` : `${data.tasksGrowth}%`,
      changeValue: data.tasksCompleted,
      icon: CheckSquare,
      trend: data.tasksGrowth >= 0 ? "up" : "down",
    },
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      change: data.usersGrowth >= 0 ? `+${data.usersGrowth}%` : `${data.usersGrowth}%`,
      changeValue: data.totalUsers,
      icon: UserCheck,
      trend: data.usersGrowth >= 0 ? "up" : "down",
    },
    {
      title: "SMS Sent",
      value: data.totalSMS.toLocaleString(),
      change: `${data.smsDelivered} delivered`,
      changeValue: data.smsDelivered,
      icon: MessageSquare,
      trend: "up",
    },
  ]
}

const todoItems: Todo[] = [
  { id: "td1", label: "Follow up with new leads", done: false, priority: "high", time: "2 hours ago" },
  { id: "td2", label: "Prepare proposal for ACME", done: false, priority: "medium", time: "4 hours ago" },
  { id: "td3", label: "Review ticket #4231", done: true, priority: "low", time: "1 day ago" },
]




// Components
const Badge = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary"
  >
    {children}
  </motion.span>
)

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
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-black" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>
    </div>
    <div className="p-4">{children}</div>
  </motion.div>
)

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <stat.icon className="h-4 w-4 text-black" />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${stat.trend === "up" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
        }`}>
        {stat.trend === "up" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
        {stat.change}
      </div>
    </div>

    <div className="space-y-1">
      <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
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
      className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 ${completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm"
        }`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCompleted(!completed)}
        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-200 ${completed ? "bg-primary border-primary" : "border-gray-300 hover:border-primary"
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

const ActivityRow = ({ activity, index }: { activity: RecentActivity; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
  >
    <div className="p-1 rounded-lg border bg-primary/10 border-primary/20">
      <div className="p-1 rounded bg-primary">
        {activity.type === "lead" && <Users className="h-3 w-3 text-white" />}
        {activity.type === "task" && <CheckSquare className="h-3 w-3 text-white" />}
        {activity.type === "meeting" && <CalendarDays className="h-3 w-3 text-white" />}
        {activity.type === "sms" && <MessageSquare className="h-3 w-3 text-white" />}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
      <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
    </div>
  </motion.div>
)


// Sidebar Component
interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    exact: true,
    badge: "4",
  },
  {
    title: "Lead Manager",
    icon: TrendingUp,
    badge: "New",
    children: [
      { title: "Leads", href: "/lead-manager/leads", icon: Users },
      { title: "SMS", href: "/lead-manager/sms", icon: MessageSquare },
      { title: "Mailbox", href: "/lead-manager/mailbox", icon: Mail },
    ],
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    badge: "12",
  },
  {
    title: "Setup",
    icon: Settings,
    children: [{ title: "Staff", href: "/setup/staff", icon: Building }],
  },
  {
    title: "Support",
    icon: Headphones,
    children: [
      { title: "Tickets", href: "/support/tickets", icon: HelpCircle },
      { title: "Knowledge Base", href: "/support/knowledge-base", icon: Shield },
      { title: "Roles", href: "/support/roles", icon: Shield },
      { title: "Settings", href: "/support/settings", icon: Settings },
    ],
  },
]

const IconWrapper = ({ icon: Icon, isActive }: { icon: any; isActive?: boolean }) => (
  <div className="flex items-center justify-center">
    <Icon
      className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-orange-600" : "text-gray-500 group-hover:text-orange-600"
        }`}
    />
  </div>
)

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["Lead Manager", "Setup", "Support"])
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (isMobile && !collapsed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isMobile, collapsed])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 280,
          x: isMobile && collapsed ? -280 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen z-50 bg-white border-r border-gray-200 shadow-sm"
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className={`${collapsed ? "p-4" : "p-6"} border-b border-gray-100`}>
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md"
                  >
                    <span className="text-white font-bold text-sm">VH</span>
                  </motion.div>
                  <span className="text-lg font-semibold text-gray-900">Vista Hub</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="p-2 rounded-lg bg-primary/10  transition-colors duration-200"
              >
                {collapsed ? <Menu className="h-5 w-5 text-black" /> : <X className="h-5 w-5 text-black" />}
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.children ? (
                  <div className="space-y-1">
                    <motion.button
                      whileHover={{ x: 2 }}
                      onClick={() => toggleExpanded(item.title)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:text-orange-600 transition-all duration-300 group hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <IconWrapper icon={item.icon} />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium text-gray-800 group-hover:text-orange-600">{item.title}</span>
                              {item.badge && (
                                <Badge>{item.badge}</Badge>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {!collapsed && (
                        <motion.div
                          animate={{ rotate: expandedItems.includes(item.title) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </motion.div>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {!collapsed && expandedItems.includes(item.title) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="ml-4 space-y-1 overflow-hidden pl-3 border-l border-gray-200"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.div
                              key={child.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.03 }}
                            >
                              <a
                                href={child.href}
                                className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 group text-sm font-medium hover:bg-gray-100 hover:text-orange-600 text-gray-700"
                              >
                                <child.icon
                                  className="h-4 w-4 text-gray-500 group-hover:text-orange-600"
                                />
                                <span className="transition-colors duration-200">
                                  {child.title}
                                </span>
                              </a>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div whileHover={{ x: 2 }}>
                    <a
                      href={item.href!}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group relative hover:bg-gray-100 hover:text-orange-600 text-gray-700"
                    >
                      <IconWrapper icon={item.icon} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 flex-1"
                          >
                            <span className="font-medium transition-colors duration-200">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge>{item.badge}</Badge>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  )
}

// Header Component
interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm">
      {/* Left side - Toggle button */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </motion.button>

        {/* Search */}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search anything..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        >
          {isDarkMode ? <span className="text-orange-500">☀️</span> : <span className="text-orange-500">🌙</span>}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            <Bell className="h-5 w-5 text-gray-600" />
          </motion.button>
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-primary text-white rounded-full">
            3
          </span>
        </div>

        {/* User Profile */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors duration-200"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
            JD
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-gray-900">John Doe</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </motion.button>
      </div>
    </header>
  )
}

// Dashboard Page Component
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()

  // Real data state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [leadsChartData, setLeadsChartData] = useState<LeadsChartData[]>([])
  const [leadsStageData, setLeadsStageData] = useState<LeadsStageData[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load all dashboard data in parallel
      const [statsResponse, chartResponse, stageResponse, activitiesResponse] = await Promise.all([
        dashboardAPI.getDashboardStats(),
        dashboardAPI.getLeadsChartData(),
        dashboardAPI.getLeadsStageData(),
        dashboardAPI.getRecentActivities()
      ])

      if (statsResponse.success) {
        setDashboardStats(statsResponse.data)
      }

      if (chartResponse.success) {
        setLeadsChartData(chartResponse.data)
      }

      if (stageResponse.success) {
        setLeadsStageData(stageResponse.data)
      }

      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate real stats from dashboard data
  const generateStats = (data: DashboardStats | null): Stat[] => {
    if (!data) {
      return [
        { title: "Total Leads", value: "Loading...", change: "", changeValue: 0, icon: Users, trend: "up" },
        { title: "Active Tasks", value: "Loading...", change: "", changeValue: 0, icon: CheckSquare, trend: "up" },
        { title: "Total Users", value: "Loading...", change: "", changeValue: 0, icon: UserCheck, trend: "up" },
        { title: "SMS Sent", value: "Loading...", change: "", changeValue: 0, icon: MessageSquare, trend: "up" },
      ]
    }

    return [
      {
        title: "Total Leads",
        value: data.totalLeads.toLocaleString(),
        change: data.leadsGrowth >= 0 ? `+${data.leadsGrowth}%` : `${data.leadsGrowth}%`,
        changeValue: data.leadsThisMonth,
        icon: Users,
        trend: data.leadsGrowth >= 0 ? "up" : "down",
      },
      {
        title: "Active Tasks",
        value: data.totalTasks.toLocaleString(),
        change: data.tasksGrowth >= 0 ? `+${data.tasksGrowth}%` : `${data.tasksGrowth}%`,
        changeValue: data.tasksCompleted,
        icon: CheckSquare,
        trend: data.tasksGrowth >= 0 ? "up" : "down",
      },
      {
        title: "Total Users",
        value: data.totalUsers.toLocaleString(),
        change: data.usersGrowth >= 0 ? `+${data.usersGrowth}%` : `${data.usersGrowth}%`,
        changeValue: data.totalUsers,
        icon: UserCheck,
        trend: data.usersGrowth >= 0 ? "up" : "down",
      },
      {
        title: "SMS Sent",
        value: data.totalSMS.toLocaleString(),
        change: `${data.smsDelivered} delivered`,
        changeValue: data.smsDelivered,
        icon: MessageSquare,
        trend: "up",
      },
    ]
  }

  const stats = generateStats(dashboardStats)

  // Compute leadsStageData from contacts list
  // Replace the entire useEffect for fetching contacts with this:
  useEffect(() => {
    const fetchContactsAndComputeStages = async () => {
      try {
        const response = await contactAPI.getContacts()
        const contacts = response.data || []

        // Log for debugging
        console.log('Contacts fetched:', contacts.length)

        // Group contacts by status with better error handling
        const grouped: Record<string, number> = {
          'New': 0,
          'Existing': 0,
          'First-Time Buyer': 0
        }

        contacts.forEach((contact: any) => {
          const status = contact?.status
          if (status && grouped.hasOwnProperty(status)) {
            grouped[status] = (grouped[status] || 0) + 1
          }
        })

        // Convert to chart data format
        const chartData: LeadsStageData[] = Object.entries(grouped)
          .filter(([_, value]) => value > 0) // Only include statuses with leads
          .map(([name, value]) => ({
            name,
            value
          }))

        console.log('Chart data computed:', chartData)
        setLeadsStageData(chartData)

      } catch (err) {
        console.error('Error loading contacts for stage chart:', err)
        // Set empty data on error
        setLeadsStageData([])
      }
    }

    // Only fetch if we have permission and user is authenticated
    if (user && hasPermission('contacts', 'read')) {
      fetchContactsAndComputeStages()
    } else {
      setLeadsStageData([])
    }
  }, [user]) // Add user as dependency

  return (
    <div className="min-h-screen  pl-3 md:pl-6 pt-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-xl mb-6 p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-900 mb-1"
            >
              Welcome back, {user?.name || 'User'}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gray-600 text-sm"
            >
              Here's what's happening with your business today. Role: <span className="font-semibold text-orange-600">{user?.role?.name}</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            {hasPermission('contacts', 'create') && (
              <button onClick={() => navigate('/lead-manager/leads')}
                className="flex items-center gap-1 px-3 py-2 bg-primary font-semibold text-white rounded-[10px] transition-colors hover:bg-primary/90">
                <Plus className="h-3 w-3 text-white" />
                Add Lead
              </button>
            )}
            {hasPermission('tasks', 'create') && (
              <button onClick={() => navigate('/tasks')} className="flex items-center gap-1 px-3 py-2 border border-primary font-semibold text-gray-800 rounded-[10px] transition-colors hover:bg-primary/5">
                <CheckSquare className="h-3 w-3" />
                New Task
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
        <div className="xl:col-span-2 space-y-6">
          <ChartCard title="Leads Growth & Conversions" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={leadsChartData.length > 0 ? leadsChartData : mockLeadsData}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="leads" stroke="#EA580C" fill="url(#leadsGradient)" name="Leads" />
                <Area type="monotone" dataKey="conversions" stroke="#EA580C" fill="url(#conversionsGradient)" name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Calendar & Schedule" icon={CalendarDays}>
            <div className="space-y-4">
              {/* Active Email Account Status */}
              <ActiveEmailAccountStatus
                onConnectionChange={(connected) => {
                  // You can add any additional logic here when email connection status changes
                }}
              />

              {/* Google Calendar Integration */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Google Calendar Integration</span>
                  </div>
                  <GoogleCalendarAuth
                    onConnectionChange={(connected) => {
                      // You can add any additional logic here when connection status changes
                    }}
                  />
                </div>
                <p className="text-xs text-orange-700">
                  Connect Google Calendar to automatically create events with Google Meet links when scheduling meetings.
                </p>
              </div>

              {/* Calendar Component */}
              <MonthCalendar />
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="My Tasks" icon={ListTodo}>
            <div className="space-y-2 max-h-80 overflow-y-auto">
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

          <ChartCard title="Quick Actions" icon={Activity}>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/ai-assistant/email-manager')}
                className="w-full flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors group"
              >
                <Mail className="h-5 w-5 text-primary group-hover:text-primary" />
                <div className="text-left">
                  <div className="text-sm font-medium text-primary">Email Manager</div>
                  <div className="text-xs text-primary">Manage sent & inbox emails</div>
                </div>
              </button>

              <button onClick={() => navigate('/ai-assistant/email')}
                className="w-full flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors group"
              >
                <MessageSquare className="h-5 w-5 text-primary group-hover:text-primary" />
                <div className="text-left">
                  <div className="text-sm font-medium text-primary">Email Generator</div>
                  <div className="text-xs text-primary">Create AI-powered emails</div>
                </div>
              </button>
            </div>
          </ChartCard>

          <ChartCard title="Leads Distribution" icon={PieChart}>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Debug Info:</h4>
              <p className="text-xs">Leads Stage Data: {JSON.stringify(leadsStageData)}</p>
              <p className="text-xs">Contacts Count: {leadsStageData.reduce((sum, item) => sum + item.value, 0)}</p>
              <p className="text-xs">Is Loading: {isLoading ? 'Yes' : 'No'}</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPieChart>
                <Pie
                  data={
                    leadsStageData.length > 0
                      ? leadsStageData
                      : [
                        { name: "No Data", value: 1 },
                      ]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  cornerRadius={8}
                  paddingAngle={2}
                  label={leadsStageData.length > 0}
                >
                  {(leadsStageData.length > 0 ? leadsStageData : [{ name: "No Data", value: 1 }]).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={leadsStageData.length > 0 ? colors[index % colors.length] : '#E5E7EB'}
                      />
                    )
                  )}
                </Pie>

                <RechartsTooltip
                  formatter={(value: number, name: string) => {
                    if (leadsStageData.length === 0) return ['No data available', '']
                    return [`${value} leads`, name]
                  }}
                  contentStyle={{
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                  itemStyle={{ color: "#111827", fontWeight: 500 }}
                />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#374151",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </div>
  )
}

// App Layout Component
interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen  flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};