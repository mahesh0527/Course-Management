"use client"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Calendar } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"
import { useAttendance } from "@/hooks/use-attendance"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AttendancePage() {
  const { subjects } = useSubjects()
  const { attendanceRecords, markAttendance, deleteRecord } = useAttendance()
  const { toast } = useToast()
  const router = useRouter()

  const handleMarkAttendance = (subjectName: string, status: "present" | "absent") => {
    markAttendance(subjectName, status)
    toast({
      title: "Attendance Marked",
      description: `Marked ${status} for ${subjectName}`,
    })
  }

  const handleDeleteRecord = (id: number) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      deleteRecord(id)
      toast({
        title: "Record Deleted",
        description: "Attendance record has been removed.",
        variant: "destructive",
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Mark Attendance</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {subjects.length === 0 ? (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400">No Subjects to Track</h2>
                <p className="text-gray-400">
                  You need to add subjects before you can mark attendance. Create your timetable first to automatically
                  generate subjects.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => router.push("/timetable")} className="golden-button">
                    Create Timetable
                  </Button>
                  <Button
                    onClick={() => router.push("/subjects")}
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Add Subjects
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Mark Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject, index) => (
                <Card key={index} className="bg-black border-yellow-400/30 golden-glow">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleMarkAttendance(subject.name, "present")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-500"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Present
                      </Button>
                      <Button
                        onClick={() => handleMarkAttendance(subject.name, "absent")}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-500"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Absent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Attendance Records */}
            <Card className="bg-black border-yellow-400/30 golden-glow">
              <CardHeader>
                <CardTitle className="text-xl text-yellow-400">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${record.status === "present" ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <div>
                          <span className="text-white font-medium">{record.subject}</span>
                          <span className="text-gray-400 ml-4">{record.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.status === "present"
                              ? "bg-green-400/20 text-green-400"
                              : "bg-red-400/20 text-red-400"
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
