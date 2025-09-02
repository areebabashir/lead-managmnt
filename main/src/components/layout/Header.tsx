"use client"

import React from "react"
import { Bell, Search, Sun, Moon, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between shadow-sm">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search anything..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 transition-colors duration-200"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-gray-600" /> : <Moon className="h-4 w-4 text-gray-600" />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 transition-colors duration-200"
          >
            <Bell className="h-4 w-4 text-gray-600" />
          </Button>
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
          >
            3
          </Badge>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 py-2 h-auto bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200"
            >
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">JD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">John Doe</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
            <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-gray-50">
              <User className="mr-2 h-4 w-4 text-gray-500" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/support/settings")} className="hover:bg-gray-50">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
