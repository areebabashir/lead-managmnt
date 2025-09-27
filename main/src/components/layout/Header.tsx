// components/layout/Header.tsx
import React from "react"
import { Bell, Search, Sun, Moon, User, LogOut, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const [showUserMenu, setShowUserMenu] = React.useState(false)
  const navigate = useNavigate()
  const { user, logout, hasPermission } = useAuth()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm ">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 pl-7">
        <div className="relative max-w-md w-full ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
       {/* 
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-colors duration-200"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-gray-600" /> : <Moon className="h-4 w-4 text-gray-600" />}
        </button> */}

        {/* Notifications */}
        

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 h-auto bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-colors duration-200"
          >
            <div className="h-8 w-8 rounded-full bg-orange-100 text-gray-700 font-semibold flex items-center justify-center">
              {user ? getUserInitials(user.name) : 'U'}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.role?.name || 'Guest'}</div>
            </div>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="p-2 space-y-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  <div className="text-xs text-orange-600 font-medium">{user?.role?.name}</div>
                </div>
{/*                 
                <button 
                  onClick={() => {
                    navigate("/profile")
                    setShowUserMenu(false)
                  }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  Profile
                </button> */}
                
                {hasPermission('settings', 'read') && (
                  <button 
                    onClick={() => {
                      navigate("/support/settings")
                      setShowUserMenu(false)
                    }} 
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    Settings
                  </button>
                )}
                
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}