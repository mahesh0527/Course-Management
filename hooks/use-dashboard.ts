"use client"

import { useSubjects } from "./use-subjects"
import { useAttendance } from "./use-attendance"

export function useDashboard() {
  const { subjects } = useSubjects()
  const { attendanceRecords } = useAttendance()

  const totalLectures = subjects.reduce((total, subject) => total + subject.totalClasses, 0)
  const attendedLectures = subjects.reduce((total, subject) => total + subject.attendedClasses, 0)

  return {
    subjects,
    attendanceRecords,
    totalLectures,
    attendedLectures,
  }
}
