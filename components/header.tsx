"use client"

import { Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-yellow-400/30 bg-black/50 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-yellow-400 hover:bg-yellow-400/10" />
          <h1 className="text-lg font-semibold text-white">Student Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-yellow-400 hover:bg-yellow-400/10">
            <Bell className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-yellow-400 hover:bg-yellow-400/10">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border-yellow-400/30">
              <DropdownMenuLabel className="text-yellow-400">{user?.fullName || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-yellow-400/30" />
              <DropdownMenuItem onClick={logout} className="text-red-400 hover:bg-red-400/10 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
