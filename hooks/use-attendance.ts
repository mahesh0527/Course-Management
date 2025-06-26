"use client"

import { useState, useEffect } from "react"

interface AttendanceRecord {
  id: number
  subject: string
  status: "present" | "absent"
  date: string
}

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    const savedRecords = localStorage.getItem("attendanceRecords")
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords))
    }
  }, [])

  const saveRecords = (records: AttendanceRecord[]) => {
    setAttendanceRecords(records)
    localStorage.setItem("attendanceRecords", JSON.stringify(records))
  }

  const markAttendance = (subjectName: string, status: "present" | "absent") => {
    const newRecord: AttendanceRecord = {
      id: Date.now(),
      subject: subjectName,
      status,
      date: new Date().toLocaleDateString(),
    }
    const newRecords = [newRecord, ...attendanceRecords]
    saveRecords(newRecords)
  }

  const deleteRecord = (id: number) => {
    const newRecords = attendanceRecords.filter((record) => record.id !== id)
    saveRecords(newRecords)
  }

  return {
    attendanceRecords,
    markAttendance,
    deleteRecord,
  }
}
