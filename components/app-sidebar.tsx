"use client"

import { BookOpen, Calendar, Home, Settings, TrendingUp, Upload, CalendarDays, GraduationCap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Subjects",
    url: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Mark Attendance",
    url: "/attendance",
    icon: Calendar,
  },
  {
    title: "Timetable",
    url: "/timetable",
    icon: CalendarDays,
  },
  {
    title: "Academic Calendar",
    url: "/academic-calendar",
    icon: GraduationCap,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: TrendingUp,
  },
  {
    title: "Upload Notes",
    url: "/notes",
    icon: Upload,
  },
  {
    title: "Route Testing",
    url: "/route-testing",
    icon: Settings,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-yellow-400/30 bg-black">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-yellow-400">StudyTracker</h2>
            <p className="text-xs text-gray-400">Attendance & Notes</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-yellow-400/80 font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-yellow-400/10 hover:text-yellow-400 transition-colors"
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
