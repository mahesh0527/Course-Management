"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  fullName: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const isAuthPage = pathname === "/login" || pathname === "/signup"

      if (!user && !isAuthPage) {
        router.push("/login")
      } else if (user && isAuthPage) {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Demo user for testing
      if (email === "demo@example.com" && password === "password") {
        const userData = {
          id: "1",
          username: "demo",
          email: "demo@example.com",
          fullName: "Demo User",
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return true
      }

      // For any other email/password, create a demo user
      const userData = {
        id: Date.now().toString(),
        username: email.split("@")[0],
        email,
        fullName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    } catch (error) {
      return false
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
      }
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
