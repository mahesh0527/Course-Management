"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Play, RotateCcw, ExternalLink } from "lucide-react"
import Link from "next/link"

interface RouteTest {
  name: string
  path: string
  description: string
  status: "pending" | "testing" | "passed" | "failed"
  responseTime?: number
  error?: string
}

export function RouteTester() {
  const [routes, setRoutes] = useState<RouteTest[]>([
    { name: "Dashboard", path: "/", description: "Main dashboard with statistics", status: "pending" },
    { name: "Login", path: "/login", description: "User authentication page", status: "pending" },
    { name: "Signup", path: "/signup", description: "User registration page", status: "pending" },
    { name: "Subjects", path: "/subjects", description: "Subject management", status: "pending" },
    { name: "Timetable", path: "/timetable", description: "Weekly schedule management", status: "pending" },
    { name: "Academic Calendar", path: "/academic-calendar", description: "Calendar configuration", status: "pending" },
    { name: "Attendance", path: "/attendance", description: "Mark attendance", status: "pending" },
    { name: "Reports", path: "/reports", description: "Attendance analytics", status: "pending" },
    { name: "Notes", path: "/notes", description: "PDF upload and management", status: "pending" },
    { name: "Settings", path: "/settings", description: "User preferences", status: "pending" },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const testRoute = async (route: RouteTest): Promise<{ success: boolean; responseTime: number; error?: string }> => {
    const startTime = Date.now()

    try {
      // Simulate route testing by checking if the route exists
      const response = await fetch(route.path, { method: "HEAD" })
      const responseTime = Date.now() - startTime

      return {
        success: response.ok || response.status === 405, // 405 is OK for HEAD requests
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const runSingleTest = async (routeIndex: number) => {
    const route = routes[routeIndex]
    setCurrentTest(route.name)

    // Update status to testing
    setRoutes((prev) => prev.map((r, i) => (i === routeIndex ? { ...r, status: "testing" as const } : r)))

    // Simulate testing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = await testRoute(route)

    // Update with results
    setRoutes((prev) =>
      prev.map((r, i) =>
        i === routeIndex
          ? {
              ...r,
              status: result.success ? ("passed" as const) : ("failed" as const),
              responseTime: result.responseTime,
              error: result.error,
            }
          : r,
      ),
    )
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setCurrentTest(null)

    // Reset all routes to pending
    setRoutes((prev) =>
      prev.map((r) => ({ ...r, status: "pending" as const, responseTime: undefined, error: undefined })),
    )

    // Run tests sequentially
    for (let i = 0; i < routes.length; i++) {
      await runSingleTest(i)
    }

    setIsRunning(false)
    setCurrentTest(null)
  }

  const resetTests = () => {
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        status: "pending" as const,
        responseTime: undefined,
        error: undefined,
      })),
    )
    setCurrentTest(null)
  }

  const getStatusIcon = (status: RouteTest["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "testing":
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: RouteTest["status"]) => {
    const variants = {
      pending: "bg-gray-500/20 text-gray-400",
      testing: "bg-yellow-500/20 text-yellow-400",
      passed: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
    }

    return <Badge className={`${variants[status]} border-0`}>{status.toUpperCase()}</Badge>
  }

  const passedTests = routes.filter((r) => r.status === "passed").length
  const failedTests = routes.filter((r) => r.status === "failed").length
  const totalTests = routes.length

  return (
    <Card className="bg-black border-yellow-400/30 golden-glow">
      <CardHeader>
        <CardTitle className="text-xl text-yellow-400 flex items-center justify-between">
          <span>Route Testing Dashboard</span>
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isRunning} className="golden-button" size="sm">
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Run All Tests"}
            </Button>
            <Button
              onClick={resetTests}
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border border-green-500/30 rounded-lg bg-green-500/10">
            <div className="text-lg font-bold text-green-400">{passedTests}</div>
            <div className="text-xs text-gray-400">Passed</div>
          </div>
          <div className="text-center p-3 border border-red-500/30 rounded-lg bg-red-500/10">
            <div className="text-lg font-bold text-red-400">{failedTests}</div>
            <div className="text-xs text-gray-400">Failed</div>
          </div>
          <div className="text-center p-3 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
            <div className="text-lg font-bold text-yellow-400">{totalTests}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>

        {/* Current Test */}
        {currentTest && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="font-medium">Currently testing: {currentTest}</span>
            </div>
          </div>
        )}

        {/* Route List */}
        <div className="space-y-2">
          {routes.map((route, index) => (
            <div
              key={route.path}
              className="flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg hover:bg-yellow-400/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(route.status)}
                <div>
                  <div className="font-medium text-white">{route.name}</div>
                  <div className="text-sm text-gray-400">{route.description}</div>
                  <div className="text-xs text-gray-500">{route.path}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {route.responseTime && <div className="text-xs text-gray-400">{route.responseTime}ms</div>}
                {route.error && (
                  <div className="text-xs text-red-400 max-w-32 truncate" title={route.error}>
                    {route.error}
                  </div>
                )}
                {getStatusBadge(route.status)}
                <Button asChild variant="ghost" size="sm" className="text-yellow-400 hover:bg-yellow-400/10">
                  <Link href={route.path}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-yellow-400">
                {passedTests + failedTests} / {totalTests}
              </span>
            </div>
            <div className="progress-bar h-2">
              <div
                className="progress-fill transition-all duration-300"
                style={{ width: `${((passedTests + failedTests) / totalTests) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
