"use client"

import { AppLayout } from "@/components/app-layout"
import { RouteTester } from "@/components/route-tester"
import { Card, CardContent } from "@/components/ui/card"
import { TestTube, Info } from "lucide-react"

export default function RouteTestingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            Route Testing
          </h1>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Route Testing Dashboard:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Automated Testing:</strong> Test all application routes automatically
                  </li>
                  <li>
                    • <strong>Performance Monitoring:</strong> Track response times for each route
                  </li>
                  <li>
                    • <strong>Real-time Status:</strong> Live updates during testing process
                  </li>
                  <li>
                    • <strong>Quick Navigation:</strong> Direct links to visit each route
                  </li>
                  <li>
                    • <strong>Error Detection:</strong> Identify and display route errors
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Tester Component */}
        <RouteTester />
      </div>
    </AppLayout>
  )
}
