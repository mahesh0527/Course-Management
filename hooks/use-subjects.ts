"use client"

import { useState, useEffect } from "react"

interface Subject {
  id: number
  name: string
  totalClasses: number
  attendedClasses: number
  requiredAttendance: number
  attendance: number
  isAutoCreated?: boolean
  lastCalculated?: string
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects")
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects))
    }
  }, [])

  const saveSubjects = (newSubjects: Subject[]) => {
    setSubjects(newSubjects)
    localStorage.setItem("subjects", JSON.stringify(newSubjects))
  }

  const addSubject = (subject: Subject) => {
    const newSubjects = [...subjects, subject]
    saveSubjects(newSubjects)
  }

  const updateSubject = (id: number, updatedSubject: Partial<Subject>) => {
    const newSubjects = subjects.map((subject) => (subject.id === id ? { ...subject, ...updatedSubject } : subject))
    saveSubjects(newSubjects)
  }

  const deleteSubject = (id: number) => {
    const newSubjects = subjects.filter((subject) => subject.id !== id)
    saveSubjects(newSubjects)
  }

  const createSubjectsFromTimetable = (timetable: any[]) => {
    const existingSubjectNames = subjects.map((s) => s.name.toLowerCase())
    const timetableSubjects = [...new Set(timetable.map((entry) => entry.subject))]

    const newSubjects: Subject[] = []

    timetableSubjects.forEach((subjectName) => {
      if (!existingSubjectNames.includes(subjectName.toLowerCase())) {
        const newSubject: Subject = {
          id: Date.now() + Math.random(),
          name: subjectName,
          totalClasses: 0,
          attendedClasses: 0,
          requiredAttendance: 80,
          attendance: 0,
          isAutoCreated: true,
        }
        newSubjects.push(newSubject)
      }
    })

    if (newSubjects.length > 0) {
      const allSubjects = [...subjects, ...newSubjects]
      saveSubjects(allSubjects)
    }

    return newSubjects
  }

  const calculateTotalClasses = (timetable: any[], academicCalendar: any) => {
    if (!academicCalendar.startDate || !academicCalendar.endDate) return

    const startDate = new Date(academicCalendar.startDate)
    const endDate = new Date(academicCalendar.endDate)
    const weekendDays = academicCalendar.weekendDays || [0, 6]

    // Calculate total weeks
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const workingDaysPerWeek = 7 - weekendDays.length
    const totalWeeks = Math.floor(totalDays / 7)

    // Count classes per subject per week
    const subjectClassCounts: { [key: string]: number } = {}
    timetable.forEach((entry) => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(entry.day)
      if (!weekendDays.includes(dayIndex)) {
        subjectClassCounts[entry.subject] = (subjectClassCounts[entry.subject] || 0) + 1
      }
    })

    // Update subjects with calculated total classes
    const updatedSubjects = subjects.map((subject) => {
      const classesPerWeek = subjectClassCounts[subject.name] || 0
      const totalClasses = classesPerWeek * totalWeeks

      return {
        ...subject,
        totalClasses,
        attendance: subject.totalClasses > 0 ? Math.round((subject.attendedClasses / totalClasses) * 100) : 0,
        lastCalculated: new Date().toISOString(),
      }
    })

    saveSubjects(updatedSubjects)
  }

  const calculateSingleSubject = (subjectId: number, timetable: any[], academicCalendar: any) => {
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject || !academicCalendar.startDate || !academicCalendar.endDate) return false

    const startDate = new Date(academicCalendar.startDate)
    const endDate = new Date(academicCalendar.endDate)
    const weekendDays = academicCalendar.weekendDays || [0, 6]

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.floor(totalDays / 7)

    // Count classes for this specific subject
    let classesPerWeek = 0
    timetable.forEach((entry) => {
      if (entry.subject === subject.name) {
        const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(
          entry.day,
        )
        if (!weekendDays.includes(dayIndex)) {
          classesPerWeek++
        }
      }
    })

    const totalClasses = classesPerWeek * totalWeeks
    const updatedSubject = {
      ...subject,
      totalClasses,
      attendance: totalClasses > 0 ? Math.round((subject.attendedClasses / totalClasses) * 100) : 0,
      lastCalculated: new Date().toISOString(),
    }

    updateSubject(subjectId, updatedSubject)
    return true
  }

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    createSubjectsFromTimetable,
    calculateTotalClasses,
    calculateSingleSubject,
  }
}
