// components/layout/Header.tsx
import React from "react"
import { Bell, Search, Sun, Moon, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const navigate = useNavigate()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

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
        <div className="relative">
          <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-colors duration-200">
            <Bell className="h-4 w-4 text-gray-600" />
          </button>
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
            3
          </span>
        </div>

        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center gap-3 px-3 py-2 h-auto bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-colors duration-200">
            <div className="h-8 w-8 rounded-full bg-orange-100 text-gray-700 font-semibold flex items-center justify-center">
              JD
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2 space-y-1">
              <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-500" />
                Profile
              </button>
              <button onClick={() => navigate("/support/settings")} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                Settings
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}