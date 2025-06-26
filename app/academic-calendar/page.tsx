"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Save, Calculator, Info, Clock } from "lucide-react"
import { useAcademicCalendar } from "@/hooks/use-academic-calendar"
import { useTimetable } from "@/hooks/use-timetable"
import { useSubjects } from "@/hooks/use-subjects"
import { useToast } from "@/hooks/use-toast"
import { CalendarDisplay } from "@/components/calendar-display"

export default function AcademicCalendarPage() {
  const { academicCalendar, updateAcademicCalendar, calculateWorkingDays, getSubjectClassCounts } =
    useAcademicCalendar()
  const { timetable } = useTimetable()
  const { subjects } = useSubjects()
  const { toast } = useToast()

  const [calendarData, setCalendarData] = useState({
    startDate: academicCalendar.startDate || "",
    endDate: academicCalendar.endDate || "",
    semesterName: academicCalendar.semesterName || "",
    holidays: academicCalendar.holidays || [],
    holidayPeriods: academicCalendar.holidayPeriods || [],
    weekendDays: academicCalendar.weekendDays || [0, 6], // Default: Sunday and Saturday
  })

  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
  })

  const [newHolidayPeriod, setNewHolidayPeriod] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })

  const daysOfWeek = [
    { value: 0, label: "Sunday", short: "Sun" },
    { value: 1, label: "Monday", short: "Mon" },
    { value: 2, label: "Tuesday", short: "Tue" },
    { value: 3, label: "Wednesday", short: "Wed" },
    { value: 4, label: "Thursday", short: "Thu" },
    { value: 5, label: "Friday", short: "Fri" },
    { value: 6, label: "Saturday", short: "Sat" },
  ]

  const handleSaveCalendar = () => {
    if (!calendarData.startDate || !calendarData.endDate) {
      toast({
        title: "Missing Dates",
        description: "Please provide both start and end dates.",
        variant: "destructive",
      })
      return
    }

    if (new Date(calendarData.startDate) >= new Date(calendarData.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      })
      return
    }

    if (calendarData.weekendDays.length === 7) {
      toast({
        title: "Invalid Weekend Configuration",
        description: "You cannot mark all days as weekends. Please select working days.",
        variant: "destructive",
      })
      return
    }

    updateAcademicCalendar(calendarData)
    toast({
      title: "Calendar Saved",
      description: "Academic calendar has been updated successfully.",
    })
  }

  const handleWeekendDayChange = (dayValue: number, checked: boolean) => {
    let updatedWeekendDays = [...calendarData.weekendDays]

    if (checked) {
      if (!updatedWeekendDays.includes(dayValue)) {
        updatedWeekendDays.push(dayValue)
      }
    } else {
      updatedWeekendDays = updatedWeekendDays.filter((day) => day !== dayValue)
    }

    setCalendarData({ ...calendarData, weekendDays: updatedWeekendDays })
  }

  const handleAddHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      const updatedHolidays = [...calendarData.holidays, newHoliday]
      setCalendarData({ ...calendarData, holidays: updatedHolidays })
      setNewHoliday({ name: "", date: "" })
      toast({
        title: "Holiday Added",
        description: `${newHoliday.name} has been added to the calendar.`,
      })
    }
  }

  const handleRemoveHoliday = (index: number) => {
    const updatedHolidays = calendarData.holidays.filter((_, i) => i !== index)
    setCalendarData({ ...calendarData, holidays: updatedHolidays })
  }

  const handleAddHolidayPeriod = () => {
    if (newHolidayPeriod.name && newHolidayPeriod.startDate && newHolidayPeriod.endDate) {
      if (new Date(newHolidayPeriod.startDate) >= new Date(newHolidayPeriod.endDate)) {
        toast({
          title: "Invalid Dates",
          description: "End date must be after start date.",
          variant: "destructive",
        })
        return
      }

      const updatedHolidayPeriods = [...calendarData.holidayPeriods, newHolidayPeriod]
      setCalendarData({ ...calendarData, holidayPeriods: updatedHolidayPeriods })
      setNewHolidayPeriod({ name: "", startDate: "", endDate: "" })
      toast({
        title: "Holiday Period Added",
        description: `${newHolidayPeriod.name} has been added to the calendar.`,
      })
    }
  }

  const handleRemoveHolidayPeriod = (index: number) => {
    const updatedHolidayPeriods = calendarData.holidayPeriods.filter((_, i) => i !== index)
    setCalendarData({ ...calendarData, holidayPeriods: updatedHolidayPeriods })
  }

  const workingDays = calculateWorkingDays(
    calendarData.startDate,
    calendarData.endDate,
    calendarData.holidays,
    calendarData.holidayPeriods,
    calendarData.weekendDays,
  )

  const workingDaysPerWeek = 7 - calendarData.weekendDays.length
  const totalWeeks = workingDaysPerWeek > 0 ? Math.floor(workingDays / workingDaysPerWeek) : 0
  const subjectClassCounts = getSubjectClassCounts(timetable, totalWeeks)

  const totalHolidayDays =
    calendarData.holidays.length +
    calendarData.holidayPeriods.reduce((total, period) => {
      return (
        total +
        Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24)) +
        1
      )
    }, 0)

  const getWeekendDayNames = () => {
    return calendarData.weekendDays
      .map((dayValue) => daysOfWeek.find((day) => day.value === dayValue)?.short)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-yellow-400">Academic Calendar</h1>
          <Button onClick={handleSaveCalendar} className="golden-button">
            <Save className="w-4 h-4 mr-2" />
            Save Calendar
          </Button>
        </div>

        {/* Calendar Setup */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Semester Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semesterName" className="text-gray-300">
                  Semester Name
                </Label>
                <Input
                  id="semesterName"
                  value={calendarData.semesterName}
                  onChange={(e) => setCalendarData({ ...calendarData, semesterName: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                  placeholder="e.g., Fall 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-gray-300">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={calendarData.startDate}
                  onChange={(e) => setCalendarData({ ...calendarData, startDate: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-300">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={calendarData.endDate}
                  onChange={(e) => setCalendarData({ ...calendarData, endDate: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekend Days Configuration */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekend Days Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-3">
                Select which days of the week are considered weekends/holidays (non-working days):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weekend-${day.value}`}
                      checked={calendarData.weekendDays.includes(day.value)}
                      onCheckedChange={(checked) => handleWeekendDayChange(day.value, checked as boolean)}
                      className="border-yellow-400/50 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                    />
                    <Label htmlFor={`weekend-${day.value}`} className="text-sm text-gray-300 cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekend Summary */}
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <Info className="w-4 h-4" />
                <span className="font-medium">Current Configuration:</span>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                <p>
                  <strong>Weekend Days:</strong> {getWeekendDayNames() || "None selected"}
                </p>
                <p>
                  <strong>Working Days per Week:</strong> {workingDaysPerWeek} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holidays Management */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400">Individual Holidays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holidayName" className="text-gray-300">
                  Holiday Name
                </Label>
                <Input
                  id="holidayName"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                  placeholder="e.g., Independence Day"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holidayDate" className="text-gray-300">
                  Holiday Date
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="holidayDate"
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                  />
                  <Button onClick={handleAddHoliday} className="golden-button">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Holidays List */}
            {calendarData.holidays.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Added Holidays:</h4>
                <div className="space-y-2">
                  {calendarData.holidays.map((holiday, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border border-yellow-400/20 rounded"
                    >
                      <div>
                        <span className="text-white font-medium">{holiday.name}</span>
                        <span className="text-gray-400 ml-2">{holiday.date}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHoliday(index)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Holiday Periods Management */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Holiday Periods & Long Breaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holidayPeriodName" className="text-gray-300">
                  Break Name
                </Label>
                <Input
                  id="holidayPeriodName"
                  value={newHolidayPeriod.name}
                  onChange={(e) => setNewHolidayPeriod({ ...newHolidayPeriod, name: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                  placeholder="e.g., Winter Break, Spring Break"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holidayPeriodStart" className="text-gray-300">
                  Start Date
                </Label>
                <Input
                  id="holidayPeriodStart"
                  type="date"
                  value={newHolidayPeriod.startDate}
                  onChange={(e) => setNewHolidayPeriod({ ...newHolidayPeriod, startDate: e.target.value })}
                  className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holidayPeriodEnd" className="text-gray-300">
                  End Date
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="holidayPeriodEnd"
                    type="date"
                    value={newHolidayPeriod.endDate}
                    onChange={(e) => setNewHolidayPeriod({ ...newHolidayPeriod, endDate: e.target.value })}
                    className="bg-black border-yellow-400/50 text-white focus:border-yellow-400"
                  />
                  <Button onClick={handleAddHolidayPeriod} className="golden-button">
                    Add Period
                  </Button>
                </div>
              </div>
            </div>

            {/* Holiday Periods List */}
            {calendarData.holidayPeriods.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Added Holiday Periods:</h4>
                <div className="space-y-2">
                  {calendarData.holidayPeriods.map((period, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg bg-yellow-400/5"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{period.name}</span>
                        <span className="text-gray-400 text-sm">
                          {period.startDate} to {period.endDate}
                          <span className="ml-2 text-yellow-400">
                            (
                            {Math.ceil(
                              (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            ) + 1}{" "}
                            days)
                          </span>
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveHolidayPeriod(index)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Statistics */}
        <Card className="bg-black border-yellow-400/30 golden-glow">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Semester Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 border border-yellow-400/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{workingDays}</div>
                <div className="text-sm text-gray-400">Working Days</div>
              </div>
              <div className="text-center p-4 border border-yellow-400/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{totalWeeks}</div>
                <div className="text-sm text-gray-400">Total Weeks</div>
              </div>
              <div className="text-center p-4 border border-yellow-400/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{workingDaysPerWeek}</div>
                <div className="text-sm text-gray-400">Working Days/Week</div>
              </div>
              <div className="text-center p-4 border border-yellow-400/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{totalHolidayDays}</div>
                <div className="text-sm text-gray-400">Total Holiday Days</div>
              </div>
              <div className="text-center p-4 border border-yellow-400/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{Object.keys(subjectClassCounts).length}</div>
                <div className="text-sm text-gray-400">Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Class Calculations */}
        {Object.keys(subjectClassCounts).length > 0 && (
          <Card className="bg-black border-yellow-400/30 golden-glow">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Calculated Classes per Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(subjectClassCounts).map(([subject, count]) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between p-3 border border-yellow-400/20 rounded-lg"
                  >
                    <span className="text-white font-medium">{subject}</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">{count} classes</div>
                      <div className="text-xs text-gray-400">
                        {totalWeeks > 0 ? Math.round((count / totalWeeks) * 10) / 10 : 0} per week
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Calendar Display */}
        {calendarData.startDate && calendarData.endDate && (
          <CalendarDisplay
            startDate={calendarData.startDate}
            endDate={calendarData.endDate}
            holidays={calendarData.holidays}
            holidayPeriods={calendarData.holidayPeriods}
            weekendDays={calendarData.weekendDays}
            semesterName={calendarData.semesterName}
          />
        )}

        {/* Information Card */}
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Enhanced Weekend & Holiday Management:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Flexible Weekend Days:</strong> Choose which days are weekends (e.g., Friday-Saturday,
                    Sunday only)
                  </li>
                  <li>
                    • <strong>Individual Holidays:</strong> Add single-day holidays like Independence Day, Diwali, etc.
                  </li>
                  <li>
                    • <strong>Holiday Periods:</strong> Add long breaks like Winter Break, Spring Break with start and
                    end dates
                  </li>
                  <li>
                    • <strong>Smart Calculation:</strong> Working days exclude weekends, individual holidays, and
                    holiday periods
                  </li>
                  <li>
                    • <strong>Flexible Systems:</strong> Supports different academic systems (5-day, 6-day weeks, etc.)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
