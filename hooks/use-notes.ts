"use client"

import { useState, useEffect } from "react"

interface Note {
  id: number
  subjectName: string
  fileName: string
  uploadDate: string
  size: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes)
    localStorage.setItem("notes", JSON.stringify(newNotes))
  }

  const uploadNote = (note: Note) => {
    const newNotes = [note, ...notes]
    saveNotes(newNotes)
  }

  const deleteNote = (id: number) => {
    const newNotes = notes.filter((note) => note.id !== id)
    saveNotes(newNotes)
  }

  return {
    notes,
    uploadNote,
    deleteNote,
  }
}
