"use client"

import { useState, useEffect } from "react"

interface Holiday {
  name: string
  date: string
}

interface HolidayPeriod {
  name: string
  startDate: string
  endDate: string
}

interface AcademicCalendar {
  startDate: string
  endDate: string
  semesterName: string
  holidays: Holiday[]
  holidayPeriods: HolidayPeriod[]
  weekendDays: number[]
}

export function useAcademicCalendar() {
  const [academicCalendar, setAcademicCalendar] = useState<AcademicCalendar>({
    startDate: "",
    endDate: "",
    semesterName: "",
    holidays: [],
    holidayPeriods: [],
    weekendDays: [0, 6], // Sunday and Saturday by default
  })

  useEffect(() => {
    const savedCalendar = localStorage.getItem("academicCalendar")
    if (savedCalendar) {
      setAcademicCalendar(JSON.parse(savedCalendar))
    }
  }, [])

  const updateAcademicCalendar = (calendar: AcademicCalendar) => {
    setAcademicCalendar(calendar)
    localStorage.setItem("academicCalendar", JSON.stringify(calendar))
  }

  const calculateWorkingDays = (
    startDate: string,
    endDate: string,
    holidays: Holiday[],
    holidayPeriods: HolidayPeriod[] = [],
    weekendDays: number[] = [0, 6],
  ) => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)
    let workingDays = 0

    // Create set of holiday dates for quick lookup
    const holidayDates = new Set(holidays.map((h) => h.date))

    // Add holiday period dates
    holidayPeriods.forEach((period) => {
      const periodStart = new Date(period.startDate)
      const periodEnd = new Date(period.endDate)
      const currentDate = new Date(periodStart)

      while (currentDate <= periodEnd) {
        holidayDates.add(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })

    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      const dateString = currentDate.toISOString().split("T")[0]

      // Check if it's not a weekend and not a holiday
      if (!weekendDays.includes(dayOfWeek) && !holidayDates.has(dateString)) {
        workingDays++
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return workingDays
  }

  const getSubjectClassCounts = (timetable: any[], totalWeeks: number) => {
    const subjectCounts: { [key: string]: number } = {}

    timetable.forEach((entry) => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(entry.day)
      if (!academicCalendar.weekendDays.includes(dayIndex)) {
        subjectCounts[entry.subject] = (subjectCounts[entry.subject] || 0) + 1
      }
    })

    // Multiply by total weeks
    Object.keys(subjectCounts).forEach((subject) => {
      subjectCounts[subject] *= totalWeeks
    })

    return subjectCounts
  }

  return {
    academicCalendar,
    updateAcademicCalendar,
    calculateWorkingDays,
    getSubjectClassCounts,
  }
}
