"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TrendingUp,
  Settings,
  Headphones,
  ChevronDown,
  Menu,
  Mail,
  MessageSquare,
  HelpCircle,
  Shield,
  Building,
  ChevronRight,
} from "lucide-react"

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
    title: "Lead M",
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

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "new" }) => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={`
      inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold
      ${
        variant === "new"
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "bg-gray-100 text-gray-700 border border-gray-200"
      }
    `}
  >
    {children}
  </motion.span>
)

// ✅ Updated IconWrapper without border/background
const IconWrapper = ({ icon: Icon, isActive }: { icon: any; isActive?: boolean }) => (
  <div className="flex items-center justify-center">
    <Icon
      className={`h-5 w-5 transition-colors duration-200 ${
        isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-800"
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

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-50 bg-white border-r border-gray-200 shadow-sm"
    >
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className={`${collapsed ? "p-4" : "p-6"} border-b border-gray-100`}>
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VH</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Vista Hub</span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
            >
              <Menu className="h-5 w-5 text-gray-600" />
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
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
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
                            <span className="font-medium text-gray-800 group-hover:text-gray-900">{item.title}</span>
                            {item.badge && (
                              <Badge variant={item.badge === "New" ? "new" : "default"}>{item.badge}</Badge>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {!collapsed && (
                      <motion.div
                        animate={{
                          rotate: expandedItems.includes(item.title) ? 180 : 0,
                        }}
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
                        transition={{ duration: 0.2 }}
                        className="ml-4 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child, childIndex) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: childIndex * 0.03 }}
                          >
                            <NavLink
                              to={child.href}
                              className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                                  isActive
                                    ? "bg-blue-50 border border-blue-200"
                                    : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <div className="flex items-center gap-3 flex-1">
                                    <child.icon
                                      className={`h-4 w-4 ${
                                        isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-800"
                                      }`}
                                    />
                                    <span
                                      className={`font-medium transition-colors duration-200 ${
                                        isActive ? "text-blue-900" : "text-gray-700 group-hover:text-gray-900"
                                      }`}
                                    >
                                      {child.title}
                                    </span>
                                  </div>
                                  {isActive && <div className="w-1 h-6 bg-blue-600 rounded-full" />}
                                </>
                              )}
                            </NavLink>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div whileHover={{ x: 2 }}>
                  <NavLink
                    to={item.href!}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
                        isActive
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconWrapper icon={item.icon} isActive={isActive} />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 flex-1"
                            >
                              <span
                                className={`font-medium transition-colors duration-200 ${
                                  isActive ? "text-blue-900" : "text-gray-800 group-hover:text-gray-900"
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge variant={item.badge === "New" ? "new" : "default"}>{item.badge}</Badge>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isActive && <div className="w-1 h-6 bg-blue-600 rounded-full" />}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.aside>
  )
}
