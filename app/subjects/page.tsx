"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Calculator, RefreshCw, Clock, Zap, BookOpen } from "lucide-react"
import { useSubjects } from "@/hooks/use-subjects"
import { useTimetable } from "@/hooks/use-timetable"
import { useAcademicCalendar } from "@/hooks/use-academic-calendar"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SubjectsPage() {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    calculateTotalClasses,
    calculateSingleSubject,
    createSubjectsFromTimetable,
  } = useSubjects()
  const { timetable } = useTimetable()
  const { academicCalendar } = useAcademicCalendar()
  const { toast } = useToast()
  const router = useRouter()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const [newSubject, setNewSubject] = useState({
    name: "",
    totalClasses: "",
    attendedClasses: "",
    requiredAttendance: "80",
  })

  const [editSubject, setEditSubject] = useState({
    name: "",
    totalClasses: "",
    attendedClasses: "",
    requiredAttendance: "80",
  })

  // Auto-create subjects from timetable when timetable changes
  useEffect(() => {
    if (timetable.length > 0) {
      const newSubjects = createSubjectsFromTimetable(timetable)
      if (newSubjects.length > 0) {
        toast({
          title: "New Subjects Added",
          description: `${newSubjects.length} subjects automatically created from your timetable.`,
        })
      }
    }
  }, [timetable])

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.totalClasses && newSubject.attendedClasses) {
      const subject = {
        id: Date.now(),
        name: newSubject.name,
        totalClasses: Number.parseInt(newSubject.totalClasses),
        attendedClasses: Number.parseInt(newSubject.attendedClasses),
        requiredAttendance: Number.parseInt(newSubject.requiredAttendance),
        attendance: Math.round(
          (Number.parseInt(newSubject.attendedClasses) / Number.parseInt(newSubject.totalClasses)) * 100,
        ),
        isAutoCreated: false,
      }
      addSubject(subject)
      setNewSubject({ name: "", totalClasses: "", attendedClasses: "", requiredAttendance: "80" })
      setIsAddDialogOpen(false)
      toast({
        title: "Subject Added",
        description: `${subject.name} has been added successfully.`,
      })
    }
  }

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject)
    setEditSubject({
      name: subject.name,
      totalClasses: subject.totalClasses.toString(),
      attendedClasses: subject.attendedClasses.toString(),
      requiredAttendance: subject.requiredAttendance.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateSubject = () => {
    if (editingSubject && editSubject.name && editSubject.totalClasses && editSubject.attendedClasses) {
      const updatedSubject = {
        name: editSubject.name,
        totalClasses: Number.parseInt(editSubject.totalClasses),
        attendedClasses: Number.parseInt(editSubject.attendedClasses),
        requiredAttendance: Number.parseInt(editSubject.requiredAttendance),
        attendance: Math.round(
          (Number.parseInt(editSubject.attendedClasses) / Number.parseInt(editSubject.totalClasses)) * 100,
        ),
      }
      updateSubject(editingSubject.id, updatedSubject)
      setIsEditDialogOpen(false)
      setEditingSubject(null)
      toast({
        title: "Subject Updated",
        description: `${updatedSubject.name} has been updated successfully.`,
      })
    }
  }

  const handleDeleteSubject = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteSubject(id)
      toast({
        title: "Subject Deleted",
        description: `${name} has been removed.`,
        variant: "destructive",
      })
    }
  }

  const handleCalculateAllClasses = () => {
    if (timetable.length === 0) {
      toast({
        title: "No Timetable",
        description: "Please add classes to your timetable first.",
        variant: "destructive",
      })
      return
    }

    if (!academicCalendar.startDate || !academicCalendar.endDate) {
      toast({
        title: "No Academic Calendar",
        description: "Please set your academic calendar dates first.",
        variant: "destructive",
      })
      return
    }

    calculateTotalClasses(timetable, academicCalendar)
    toast({
      title: "All Classes Calculated",
      description: "Total classes have been calculated for all subjects based on your timetable and academic calendar.",
    })
  }

  const handleCalculateSingleSubject = (subjectId: number, subjectName: string) => {
    if (timetable.length === 0) {
      toast({
        title: "No Timetable",
        description: "Please add classes to your timetable first.",
        variant: "destructive",
      })
      return
    }

    if (!academicCalendar.startDate || !academicCalendar.endDate) {
      toast({
        title: "No Academic Calendar",
        description: "Please set your academic calendar dates first.",
        variant: "destructive",
      })
      return
    }

    const success = calculateSingleSubject(subjectId, timetable, academicCalendar)
    if (success) {
      toast({
        title: "Classes Calculated",
        description: `Total classes calculated for ${subjectName}.`,
      })
    } else {
      toast({
        title: "Calculation Failed",
        description: `Could not calculate classes for ${subjectName}. Check if it exists in your timetable.`,
        variant: "destructive",
      })
    }
  }

  const handleSyncWithTimetable = () => {
    const newSubjects = createSubjectsFromTimetable(timetable)
    if (newSubjects.length > 0) {
      toast({
        title: "Subjects Synced",
        description: `${newSubjects.length} new subjects added from your timetable.`,
      })
    } else {
      toast({
        title: "Already Synced",
        description: "All timetable subjects are already in your subjects list.",
      })
    }
  }

  const formatLastCalculated = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Manage Subjects</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleSyncWithTimetable}
              variant="outline"
              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync with Timetable
            </Button>
            <Button onClick={handleCalculateAllClasses} className="golden-button">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate All Classes
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="golden-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-yellow-400/30">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Add New Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectName" className="text-gray-300">
                        Subject Name
                      </Label>
                      <Input
                        id="subjectName"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                        placeholder="Enter subject name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalClasses" className="text-gray-300">
                        Total Classes
                      </Label>
                      <Input
                        id="totalClasses"
                        type="number"
                        value={newSubject.totalClasses}
                        onChange={(e) => setNewSubject({ ...newSubject, totalClasses: e.target.value })}
                        className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                        placeholder="Total classes"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attendedClasses" className="text-gray-300">
                        Classes Attended
                      </Label>
                      <Input
                        id="attendedClasses"
                        type="number"
                        value={newSubject.attendedClasses}
                        onChange={(e) => setNewSubject({ ...newSubject, attendedClasses: e.target.value })}
                        className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                        placeholder="Classes attended"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requiredAttendance" className="text-gray-300">
                        Required Attendance (%)
                      </Label>
                      <Input
                        id="requiredAttendance"
                        type="number"
                        value={newSubject.requiredAttendance}
                        onChange={(e) => setNewSubject({ ...newSubject, requiredAttendance: e.target.value })}
                        className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                        placeholder="80"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubject} className="golden-button flex-1">
                      Add Subject
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Auto-Sync Feature:</p>
                <p className="text-xs">
                  Subjects are automatically created when you add them to your timetable. Use individual "Calculate"
                  buttons to update specific subjects or "Calculate All" for bulk updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-yellow-400/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400">No Subjects Yet</h2>
                <p className="text-gray-400">
                  Add subjects manually or create your timetable first. Subjects will be automatically created from your
                  timetable entries.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => setIsAddDialogOpen(true)} className="golden-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject Manually
                  </Button>
                  <Button
                    onClick={() => router.push("/timetable")}
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Create Timetable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">Current Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border border-yellow-400/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                        {subject.isAutoCreated && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Auto-created
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">
                          {subject.attendedClasses}/{subject.totalClasses} classes
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            subject.attendance >= subject.requiredAttendance ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {subject.attendance}%
                        </span>
                      </div>
                      <div className="progress-bar h-2 mt-2 w-48">
                        <div className="progress-fill" style={{ width: `${subject.attendance}%` }} />
                      </div>
                      {subject.lastCalculated && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            Last calculated: {formatLastCalculated(subject.lastCalculated)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 hover:bg-green-400/10"
                        onClick={() => handleCalculateSingleSubject(subject.id, subject.name)}
                        title="Calculate classes for this subject"
                      >
                        <Calculator className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-yellow-400 hover:bg-yellow-400/10"
                        onClick={() => handleEditSubject(subject)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-400/10"
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Subject Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-black border-yellow-400/30">
            <DialogHeader>
              <DialogTitle className="text-yellow-400">Edit Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSubjectName" className="text-gray-300">
                    Subject Name
                  </Label>
                  <Input
                    id="editSubjectName"
                    value={editSubject.name}
                    onChange={(e) => setEditSubject({ ...editSubject, name: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTotalClasses" className="text-gray-300">
                    Total Classes
                  </Label>
                  <Input
                    id="editTotalClasses"
                    type="number"
                    value={editSubject.totalClasses}
                    onChange={(e) => setEditSubject({ ...editSubject, totalClasses: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                    placeholder="Total classes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAttendedClasses" className="text-gray-300">
                    Classes Attended
                  </Label>
                  <Input
                    id="editAttendedClasses"
                    type="number"
                    value={editSubject.attendedClasses}
                    onChange={(e) => setEditSubject({ ...editSubject, attendedClasses: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                    placeholder="Classes attended"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRequiredAttendance" className="text-gray-300">
                    Required Attendance (%)
                  </Label>
                  <Input
                    id="editRequiredAttendance"
                    type="number"
                    value={editSubject.requiredAttendance}
                    onChange={(e) => setEditSubject({ ...editSubject, requiredAttendance: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                    placeholder="80"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateSubject} className="golden-button flex-1">
                  Update Subject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
