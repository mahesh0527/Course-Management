"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Lock, Bell, Palette } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    defaultAttendance: "80",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    attendanceAlerts: true,
    weeklyReports: false,
  })

  const [darkMode, setDarkMode] = useState(true)

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Settings</h1>
        </div>

        {/* Profile Settings */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultAttendance" className="text-gray-300">
                Default Required Attendance (%)
              </Label>
              <Input
                id="defaultAttendance"
                type="number"
                value={profile.defaultAttendance}
                onChange={(e) => setProfile({ ...profile, defaultAttendance: e.target.value })}
                className="bg-black border-yellow-400/50 text-white focus:border-yellow-400 max-w-xs"
              />
            </div>
            <Button onClick={handleProfileUpdate} className="golden-button">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-300">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handlePasswordChange} className="golden-button">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Attendance Alerts</Label>
                <p className="text-sm text-gray-400">Get alerts when attendance drops below threshold</p>
              </div>
              <Switch
                checked={notifications.attendanceAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, attendanceAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Weekly Reports</Label>
                <p className="text-sm text-gray-400">Receive weekly attendance summary</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Dark Mode</Label>
                <p className="text-sm text-gray-400">Use dark theme (recommended)</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
