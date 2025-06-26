"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, CheckCircle, BookOpen } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const { subjects } = useSubjects()
  const router = useRouter()

  const getSubjectReports = () => {
    return subjects.map((subject) => {
      const needed = Math.max(
        0,
        Math.ceil((subject.requiredAttendance * subject.totalClasses) / 100 - subject.attendedClasses),
      )
      let status = "good"

      if (subject.attendance >= 90) {
        status = "excellent"
      } else if (subject.attendance < subject.requiredAttendance) {
        status = "warning"
      }

      return {
        ...subject,
        needed,
        status,
      }
    })
  }

  const subjectReports = getSubjectReports()
  const overallAttendance =
    subjects.length > 0 ? Math.round(subjects.reduce((acc, sub) => acc + sub.attendance, 0) / subjects.length) : 0

  if (subjects.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-yellow-400">Attendance Reports</h1>
          </div>

          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400">No Data to Report</h2>
                <p className="text-gray-400">
                  Add subjects and start tracking attendance to see detailed reports and analytics.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => router.push("/subjects")} className="golden-button">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Subjects
                  </Button>
                  <Button
                    onClick={() => router.push("/attendance")}
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Mark Attendance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Attendance Reports</h1>
        </div>

        {/* Overall Stats */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overall Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">{overallAttendance}%</div>
              <div className="progress-bar h-4 max-w-md mx-auto">
                <div className="progress-fill" style={{ width: `${overallAttendance}%` }} />
              </div>
              <p className="text-gray-400 mt-2">Average across all subjects</p>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjectReports.map((subject, index) => (
            <Card key={index} className="bg-black border-yellow-400/30 golden-glow">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center justify-between">
                  {subject.name}
                  {subject.status === "excellent" && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {subject.status === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {subject.status === "good" && <CheckCircle className="w-5 h-5 text-blue-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Classes Attended</span>
                  <span className="text-white font-semibold">
                    {subject.attendedClasses}/{subject.totalClasses}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attendance</span>
                    <span className={`font-semibold ${subject.attendance >= 80 ? "text-green-400" : "text-red-400"}`}>
                      {subject.attendance}%
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className="progress-fill" style={{ width: `${subject.attendance}%` }} />
                  </div>
                </div>

                {subject.needed > 0 ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">
                      ⚠️ You need to attend <strong>{subject.needed} more classes</strong> to reach{" "}
                      {subject.requiredAttendance}% attendance
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm">✅ You're meeting the attendance requirement!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
