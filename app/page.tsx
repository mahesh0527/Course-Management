"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useSubjects } from "@/hooks/use-subjects"

export default function Dashboard() {
  const { subjects } = useSubjects()

  const totalSubjects = subjects.length
  const averageAttendance =
    subjects.length > 0 ? Math.round(subjects.reduce((acc, sub) => acc + sub.attendance, 0) / subjects.length) : 0
  const totalPDFs = 0 // This would come from a PDF hook

  const hasData = subjects.length > 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Dashboard</h1>
          <p className="text-gray-400">Welcome back, Student!</p>
        </div>

        {!hasData ? (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-yellow-400">Welcome to StudyTracker!</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Get started by setting up your academic calendar and adding your timetable. Subjects will be
                  automatically created from your timetable.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button asChild className="golden-button">
                    <Link href="/academic-calendar">Set Up Calendar</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    <Link href="/timetable">Add Timetable</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black border-yellow-400/30 golden-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{totalSubjects}</div>
                  <p className="text-xs text-gray-400">Active courses</p>
                </CardContent>
              </Card>

              <Card className="bg-black border-yellow-400/30 golden-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Average Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{averageAttendance}%</div>
                  <p className="text-xs text-gray-400">Overall performance</p>
                </CardContent>
              </Card>

              <Card className="bg-black border-yellow-400/30 golden-glow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total PDFs</CardTitle>
                  <FileText className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{totalPDFs}</div>
                  <p className="text-xs text-gray-400">Study materials</p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Cards */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-yellow-400">Your Subjects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((subject, index) => (
                  <Card key={index} className="bg-black border-yellow-400/30 golden-glow">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{subject.name}</CardTitle>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Attendance</span>
                          <span className="text-yellow-400 font-semibold">{subject.attendance}%</span>
                        </div>
                        <div className="progress-bar h-2">
                          <div className="progress-fill" style={{ width: `${subject.attendance}%` }} />
                        </div>
                        <p className="text-xs text-gray-400">
                          {subject.attendedClasses}/{subject.totalClasses} classes attended
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button asChild className="golden-button flex-1" size="sm">
                          <Link href="/attendance">View Attendance</Link>
                        </Button>
                        <Button asChild className="golden-button flex-1" size="sm">
                          <Link href="/notes">View Notes</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
