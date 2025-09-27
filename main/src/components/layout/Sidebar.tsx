// components/layout/Sidebar.tsx
import React from "react"
import { NavLink, useLocation } from "react-router-dom"
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
  Shield,
  Sparkles,
  BarChart3,
  FileText,
  Calendar,
  Bot,
  UserCog,
  Database,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useCompany } from "../../contexts/CompanyContext"

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  exact?: boolean
  show: boolean
  badge?: string
  children?: MenuItem[]
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const getMenuItems = (
  hasPermission: (resource: string, action: string) => boolean,
  userRole?: string
): MenuItem[] => {
  const isSuperAdmin = userRole === "Super Admin"

  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      exact: true,
      show: true,
      badge: "New", // 👈 Example badge
    },
    {
      title: "Lead Manager",
      icon: TrendingUp,
      show: isSuperAdmin || hasPermission("contacts", "read"),
      children: [
        {
          title: "Leads",
          href: "/lead-manager/leads",
          icon: Users,
          show: isSuperAdmin || hasPermission("contacts", "read"),
        },
        {
          title: "SMS",
          href: "/lead-manager/sms",
          icon: MessageSquare,
          show: isSuperAdmin || hasPermission('contacts', 'read')
        }
        // { 
        //   title: "Mailbox", 
        //   href: "/lead-manager/mailbox", 
        //   icon: Mail,
        //   show: isSuperAdmin || hasPermission('contacts', 'read')
        // },
      ],
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      href: "/tasks",
      show: isSuperAdmin || hasPermission("tasks", "read"),
    },
    {
      title: "Meeting Scheduling",
      icon: Calendar,
      href: "/meeting-scheduling",
      show: isSuperAdmin || hasPermission("calendar", "read"),
    },
    // {
    //   title: "Analytics",
    //   icon: BarChart3,
    //   show: isSuperAdmin || hasPermission('dashboards', 'read'),
    //   children: [
    //     { 
    //       title: "Reports", 
    //       href: "/analytics/reports", 
    //       icon: FileText,
    //       show: isSuperAdmin || hasPermission('reports', 'read')
    //     },
    //     { 
    //       title: "Performance", 
    //       href: "/anylatics/performance", 
    //       icon: TrendingUp,
    //       show: isSuperAdmin || hasPermission('analytics', 'read')
    //     },
    //   ],
    // },
    {
      title: "AI Assistant",
      icon: Bot,
      show: isSuperAdmin || hasPermission("ai_generator", "read"),
      children: [
        // { 
        //   title: "Overview", 
        //   href: "/ai-assistant", 
        //   icon: BarChart3,
        //   show: isSuperAdmin || hasPermission('ai_generator', 'read')
        // },
        { 
          title: "Email Generator", 
          href: "/ai-assistant/email", 
          icon: Mail,
          show: isSuperAdmin || hasPermission("ai_generator", "generate"),
        },
        {
          title: "Email Manager",
          href: "/ai-assistant/email-manager",
          icon: Database,
          show: isSuperAdmin || hasPermission("ai_generator", "read"),
        },
        {
          title: "Meeting Notes",
          href: "/ai-assistant/meetings",
          icon: FileText,
          show: isSuperAdmin || hasPermission('meeting_notes', 'create')
        },
        { 
          title: "Notes Manager", 
          href: "/ai-assistant/meeting-notes-manager", 
          icon: Database,
          show: isSuperAdmin || hasPermission('meeting_notes', 'read')
        }
        // { 
        //   title: "Custom Prompts", 
        //   href: "/ai-assistant/prompts", 
        //   icon: Bot,
        //   show: isSuperAdmin || hasPermission('ai_generator', 'generate')
        // },
      ],
    },
    {
      title: "Setup",
      icon: Settings,
      show: isSuperAdmin || hasPermission("users", "read"),
      children: [
        {
          title: "User Management",
          href: "/setup/users",
          icon: UserCog,
          show: isSuperAdmin || hasPermission("users", "read"),
        },
      ],
    },
    {
      title: "Support",
      icon: Headphones,
      show: isSuperAdmin || hasPermission("settings", "read") || hasPermission("roles", "read"),
      children: [
        // { 
        //   title: "Tickets", 
        //   href: "/support/tickets", 
        //   icon: HelpCircle,
        //   show: isSuperAdmin || hasPermission('tickets', 'read')
        // },
        // { 
        //   title: "Knowledge Base", 
        //   href: "/support/knowledge-base", 
        //   icon: Shield,
        //   show: isSuperAdmin || hasPermission('settings', 'read')
        // },
                         { 
                   title: "Roles", 
                   href: "/support/roles", 
                   icon: Shield,
                   show: isSuperAdmin || hasPermission('roles', 'read')
                 },
                 { 
                   title: "Role Assignment", 
                   href: "/support/role-assignment", 
                   icon: UserCog,
                   show: isSuperAdmin || hasPermission('roles', 'assign')
                 },
        { 
          title: "Settings", 
          href: "/support/settings", 
          icon: Settings,
          show: isSuperAdmin || hasPermission("settings", "read"),
        },
      ],
    },
  ]
}

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "new"
}) => (
  <span
    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${
      variant === "new" ? "bg-gray-50 text-black" : "bg-gray-50 text-black"
    }`}
  >
    {children}
  </span>
)

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])
  const location = useLocation()
  const { hasPermission, userRole } = useAuth()
  const { company } = useCompany()
  // console.log(hasPermission('contacts', 'read'))
  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  const menuItems = getMenuItems(hasPermission, userRole).filter((item) => item.show)

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
                {/* Company Logo or Default Icon */}
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-9 h-9 rounded-xl object-cover shadow-md"
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md ${company?.logo ? 'hidden' : ''}`}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  <i>{company?.name || 'Melnitz'}</i>
                </span>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-[10px] bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isParentActive = item.children?.some((child) =>
              location.pathname.startsWith(child.href ?? "")
            )

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.children ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group 
                        ${isParentActive ? "text-black" : "text-black hover:bg-primary/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-black" />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">{item.title}</span>
                              {(item as any).badge && (
                                <Badge variant={(item as any).badge === "New" ? "new" : "default"}>{(item as any).badge}</Badge>
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
                          <ChevronDown className="h-4 w-4 text-black" />
                        </motion.div>
                      )}
                    </button>

                    <AnimatePresence>
                      {!collapsed && expandedItems.includes(item.title) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-4 space-y-1 overflow-hidden"
                        >
                          {item.children
                            .filter((child) => child.show)
                            .map((child, childIndex) => (
                              <motion.div
                                key={child.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: childIndex * 0.03 }}
                              >
                                <NavLink
                                  to={child.href!}
                                  className={({ isActive }) =>
                                    `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                                      isActive
                                        ? "bg-primary/10 text-black"
                                        : "text-black hover:bg-primary/5"
                                    }`
                                  }
                                >
                                  {() => (
                                    <>
                                      <child.icon className="h-4 w-4 text-black" />
                                      <span className="font-medium">{child.title}</span>
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
                  <NavLink
                    to={item.href!}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
                        isActive
                          ? "bg-primary/10 text-black"
                          : "text-black hover:bg-primary/5"
                      }`
                    }
                  >
                    {() => (
                      <>
                        <item.icon className="h-5 w-5 text-black" />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 flex-1"
                            >
                              <span className="font-medium">{item.title}</span>
                              {(item as any).badge && (
                                <Badge variant={(item as any).badge === "New" ? "new" : "default"}>{(item as any).badge}</Badge>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </NavLink>
                )}
              </motion.div>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}
