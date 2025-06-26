"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarDays, Plus, Edit, Trash2, Zap, BookOpen } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"
import { useTimetable } from "@/hooks/use-timetable"
import { useToast } from "@/hooks/use-toast"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const timeSlots = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
]

export default function TimetablePage() {
  const { subjects, createSubjectsFromTimetable } = useSubjects()
  const { timetable, addEntry, deleteEntry, getUniqueSubjects } = useTimetable()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState({ day: "", timeSlot: "" })
  const [formData, setFormData] = useState({
    day: "",
    timeSlot: "",
    subject: "",
  })

  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" })

  // Auto-sync subjects when timetable changes
  useEffect(() => {
    if (timetable.length > 0) {
      createSubjectsFromTimetable(timetable)
    }
  }, [timetable])

  const openDialog = (day = "", timeSlot = "") => {
    setSelectedSlot({ day, timeSlot })
    setFormData({ day, timeSlot, subject: "" })
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.day && formData.timeSlot && formData.subject) {
      const newEntry = {
        id: Date.now(),
        day: formData.day,
        timeSlot: formData.timeSlot,
        subject: formData.subject,
      }

      addEntry(newEntry)

      // Check if this creates a new subject
      const existingSubject = subjects.find((s) => s.name === formData.subject)
      if (!existingSubject) {
        toast({
          title: "New Subject Added",
          description: `${formData.subject} has been automatically added to your subjects list.`,
        })
      } else {
        toast({
          title: "Class Added",
          description: `${formData.subject} scheduled for ${formData.day} at ${formData.timeSlot}`,
        })
      }

      setIsDialogOpen(false)
      setFormData({ day: "", timeSlot: "", subject: "" })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this class?")) {
      deleteEntry(id)
      toast({
        title: "Class Deleted",
        description: "The class has been removed from your timetable.",
        variant: "destructive",
      })
    }
  }

  const getTodaysClasses = () => {
    return timetable.filter((entry) => entry.day === currentDay)
  }

  const getEntryForSlot = (day: string, timeSlot: string) => {
    return timetable.find((entry) => entry.day === day && entry.timeSlot === timeSlot)
  }

  const uniqueSubjects = getUniqueSubjects()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Weekly Timetable</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="golden-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-yellow-400/30">
              <DialogHeader>
                <DialogTitle className="text-yellow-400">Add Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Day</Label>
                  <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                    <SelectTrigger className="bg-black border-yellow-400/50">
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-400/50">
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Time Slot</Label>
                  <Select
                    value={formData.timeSlot}
                    onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                  >
                    <SelectTrigger className="bg-black border-yellow-400/50">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-yellow-400/50">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Subject</Label>
                  <div className="space-y-2">
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                      placeholder="Enter subject name or select from existing"
                    />
                    {uniqueSubjects.length > 0 && (
                      <div className="text-xs text-gray-400">Existing subjects: {uniqueSubjects.join(", ")}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="golden-button flex-1">
                    Save Class
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Auto-Sync Information */}
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-400 mt-0.5" />
              <div className="text-sm text-green-300">
                <p className="font-medium mb-1">Smart Auto-Sync:</p>
                <p className="text-xs">
                  When you add subjects to your timetable, they're automatically created in your subjects list. Go to
                  the Academic Calendar to set semester dates, then use "Calculate Classes" to get total class counts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects in Timetable */}
        {uniqueSubjects.length > 0 && (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects in Your Timetable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {uniqueSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-yellow-400 text-sm"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Classes */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Today's Classes - {currentDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTodaysClasses().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTodaysClasses().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-yellow-400">{entry.timeSlot}</div>
                      <div className="text-white">{entry.subject}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-yellow-400 hover:bg-yellow-400/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-400/10"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No classes scheduled for today!</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Timetable Grid */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-yellow-400 w-32">Time</th>
                    {days.map((day) => (
                      <th
                        key={day}
                        className={`text-center p-2 ${day === currentDay ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="p-2 font-semibold text-yellow-400 border-r border-yellow-400/20">{timeSlot}</td>
                      {days.map((day) => {
                        const entry = getEntryForSlot(day, timeSlot)
                        return (
                          <td
                            key={`${day}-${timeSlot}`}
                            className={`p-2 text-center border border-yellow-400/10 ${day === currentDay ? "bg-yellow-400/5" : ""}`}
                          >
                            {entry ? (
                              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded p-2 relative group">
                                <div className="text-sm font-medium text-white">{entry.subject}</div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-yellow-400 hover:bg-yellow-400/20"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
                                    onClick={() => handleDelete(entry.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-12 border-dashed border border-yellow-400/30 text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/5"
                                onClick={() => openDialog(day, timeSlot)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
