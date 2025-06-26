"use client"

import { useState, useEffect } from "react"

interface TimetableEntry {
  id: number
  day: string
  timeSlot: string
  subject: string
}

export function useTimetable() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])

  useEffect(() => {
    const savedTimetable = localStorage.getItem("timetable")
    if (savedTimetable) {
      setTimetable(JSON.parse(savedTimetable))
    }
  }, [])

  const saveTimetable = (newTimetable: TimetableEntry[]) => {
    setTimetable(newTimetable)
    localStorage.setItem("timetable", JSON.stringify(newTimetable))
  }

  const addEntry = (entry: TimetableEntry) => {
    const newTimetable = [...timetable, entry]
    saveTimetable(newTimetable)
  }

  const deleteEntry = (id: number) => {
    const newTimetable = timetable.filter((entry) => entry.id !== id)
    saveTimetable(newTimetable)
  }

  const getUniqueSubjects = () => {
    return [...new Set(timetable.map((entry) => entry.subject))]
  }

  return {
    timetable,
    addEntry,
    deleteEntry,
    getUniqueSubjects,
  }
}
