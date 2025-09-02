import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Bell
} from 'lucide-react';

// Header Component
const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-300 text-gray-600 hover:text-gray-800">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-300 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 mt-auto"
    >
      <div className="flex flex-col md:flex-row items-center justify-between p-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
            VH
          </div>
          <p className="text-sm text-gray-600">
            © 2024 Vista Hub. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Terms
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Privacy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Support
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            Contact
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: item * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Card {item}</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-800">${item * 1250}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item % 2 === 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              +{item * 12}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Sidebar Component (your complete implementation)
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard, 
    href: '/', 
    exact: true,
    badge: '4',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Lead Manager',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    badge: 'New',
    children: [
      { title: 'Leads', href: '/lead-manager/leads', icon: Users },
      { title: 'SMS', href: '/lead-manager/sms', icon: MessageSquare },
      { title: 'Mailbox', href: '/lead-manager/mailbox', icon: Mail },
    ]
  },
  { 
    title: 'Tasks', 
    icon: CheckSquare, 
    href: '/tasks',
    color: 'from-purple-500 to-violet-500',
    badge: '12'
  },
  {
    title: 'Setup',
    icon: Settings,
    color: 'from-gray-500 to-slate-500',
    children: [
      { title: 'Staff', href: '/setup/staff', icon: Building },
    ]
  },
  {
    title: 'Support',
    icon: Headphones,
    color: 'from-pink-500 to-rose-500',
    children: [
      { title: 'Tickets', href: '/support/tickets', icon: HelpCircle },
      { title: 'Knowledge Base', href: '/support/knowledge-base', icon: Shield },
      { title: 'Roles', href: '/support/roles', icon: Shield },
      { title: 'Settings', href: '/support/settings', icon: Settings },
    ]
  }
];

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'new' }) => (
  <motion.span 
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={`
      inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold
      ${variant === 'new' 
        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/25' 
        : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
      }
    `}
  >
    {children}
  </motion.span>
);

const IconWrapper = ({ icon: Icon, color, isActive }: { icon: any, color?: string, isActive?: boolean }) => (
  <div className={`
    relative p-2 rounded-xl transition-all duration-300 group
    ${isActive 
      ? `bg-gradient-to-r ${color || 'from-blue-500 to-cyan-500'} shadow-lg shadow-blue-500/25` 
      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
    }
  `}>
    <Icon className={`h-5 w-5 transition-all duration-300 ${
      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
    }`} />
    {isActive && (
      <motion.div
        layoutId="activeGlow"
        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color || 'from-blue-500 to-cyan-500'} opacity-20 blur-xl`}
        initial={false}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Lead Manager', 'Setup', 'Support']);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024); // < lg
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 h-screen z-50 overflow-hidden"
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-white/10" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_40%_80%,rgba(119,198,255,0.3),transparent_50%)]" />
      </div>

      <div className="relative flex flex-col h-full">
        {/* Simple brand row: show name when expanded, hide on collapse; toggle icon always visible */}
        <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-white/10`}>
          <div className="flex items-center justify-between">
            {!collapsed && (
              <span className="text-lg font-semibold text-white">Vista Hub</span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-white/70 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, index) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.children ? (
                <div className="space-y-1">
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={() => toggleExpanded(item.title)}
                    onMouseEnter={() => setHoveredItem(item.title)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <IconWrapper 
                        icon={item.icon} 
                        color={item.color}
                        isActive={hoveredItem === item.title}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <span className="font-semibold text-white/90 group-hover:text-white">
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge variant={item.badge === 'New' ? 'new' : 'default'}>
                                {item.badge}
                              </Badge>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {!collapsed && (
                      <motion.div
                        animate={{ 
                          rotate: expandedItems.includes(item.title) ? 180 : 0 
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4 text-white/50 group-hover:text-white/70" />
                      </motion.div>
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {!collapsed && expandedItems.includes(item.title) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child, childIndex) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: childIndex * 0.05 }}
                          >
                            <NavLink
                              to={child.href}
                              className={({ isActive }) =>
                                `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/20 shadow-lg' 
                                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                                      isActive 
                                        ? 'bg-white/20' 
                                        : 'bg-white/5 group-hover:bg-white/10'
                                    }`}>
                                      {child.icon ? 
                                        <child.icon className={`h-4 w-4 ${
                                          isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                                        }`} /> :
                                        <ChevronRight className={`h-4 w-4 ${
                                          isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                                        }`} />
                                      }
                                    </div>
                                    <span className={`font-medium transition-colors duration-300 ${
                                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                                    }`}>
                                      {child.title}
                                    </span>
                                  </div>
                                  {isActive && (
                                    <motion.div
                                      layoutId="activeBorder"
                                      className="w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"
                                      initial={false}
                                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                  )}
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
                      `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/20 shadow-lg' 
                          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconWrapper 
                          icon={item.icon} 
                          color={item.color}
                          isActive={isActive}
                        />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 flex-1"
                            >
                              <span className={`font-semibold transition-colors duration-300 ${
                                isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                              }`}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge variant={item.badge === 'New' ? 'new' : 'default'}>
                                  {item.badge}
                                </Badge>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeBorder"
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"
                            initial={false}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Footer removed per request */}
      </div>
    </motion.aside>
  );
};

// Main Layout Component
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div 
        className="flex-1 flex flex-col transition-all duration-300" 
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

// No default export: this file provides the Sidebar named export