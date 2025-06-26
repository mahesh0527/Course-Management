"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Github, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        })
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Coming Soon",
      description: `${provider} login will be available soon!`,
    })
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-black" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-yellow-400">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your StudyTracker account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button variant="outline" className="social-btn" onClick={() => handleSocialLogin("Google")}>
              <Mail className="w-5 h-5" />
              Continue with Google
            </Button>

            <Button variant="outline" className="social-btn" onClick={() => handleSocialLogin("GitHub")}>
              <Github className="w-5 h-5" />
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-yellow-400/50 text-white focus:border-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-yellow-400/50 text-white focus:border-yellow-400"
                required
              />
              <div className="text-right">
                <Link href="#" className="text-sm text-yellow-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold hover:from-yellow-500 hover:to-yellow-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-yellow-400 hover:underline font-medium">
              Sign up
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
            <p className="text-xs text-yellow-400 text-center">
              <strong>Demo:</strong> demo@example.com / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
