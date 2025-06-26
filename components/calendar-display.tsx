"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface Holiday {
  name: string
  date: string
}

interface HolidayPeriod {
  name: string
  startDate: string
  endDate: string
}

interface CalendarDisplayProps {
  startDate: string
  endDate: string
  holidays: Holiday[]
  holidayPeriods: HolidayPeriod[]
  weekendDays: number[]
  semesterName: string
}

export function CalendarDisplay({
  startDate,
  endDate,
  holidays,
  holidayPeriods,
  weekendDays,
  semesterName,
}: CalendarDisplayProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate))

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return holidays.some((holiday) => holiday.date === dateStr)
  }

  const isInHolidayPeriod = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return holidayPeriods.some((period) => dateStr >= period.startDate && dateStr <= period.endDate)
  }

  const isWeekend = (date: Date) => {
    return weekendDays.includes(date.getDay())
  }

  const isInSemester = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return dateStr >= startDate && dateStr <= endDate
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getHolidayName = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const holiday = holidays.find((h) => h.date === dateStr)
    if (holiday) return holiday.name

    const period = holidayPeriods.find((p) => dateStr >= p.startDate && dateStr <= p.endDate)
    return period?.name
  }

  const getDayClass = (date: Date) => {
    if (!isInSemester(date)) return "text-gray-600 bg-gray-900"
    if (isHoliday(date)) return "text-white bg-red-600"
    if (isInHolidayPeriod(date)) return "text-white bg-orange-600"
    if (isWeekend(date)) return "text-white bg-blue-600"
    return "text-white bg-green-600"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Calculate month statistics
  const monthDays = days.filter((day) => day !== null) as Date[]
  const workingDays = monthDays.filter(
    (date) => isInSemester(date) && !isWeekend(date) && !isHoliday(date) && !isInHolidayPeriod(date),
  ).length
  const holidayDays = monthDays.filter(
    (date) => isInSemester(date) && (isHoliday(date) || isInHolidayPeriod(date)),
  ).length
  const weekendDaysCount = monthDays.filter((date) => isInSemester(date) && isWeekend(date)).length

  return (
    <Card className="bg-black border-yellow-400/30 golden-glow">
      <CardHeader>
        <CardTitle className="text-xl text-yellow-400 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Academic Calendar - {semesterName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="text-yellow-400 hover:bg-yellow-400/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold text-white">{monthName}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth("next")}
            className="text-yellow-400 hover:bg-yellow-400/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-yellow-400 p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-sm rounded cursor-pointer
                transition-all duration-200 hover:scale-105 relative
                ${date ? getDayClass(date) : "bg-transparent"}
                ${date && isToday(date) ? "ring-2 ring-yellow-400" : ""}
              `}
              title={date ? getHolidayName(date) || "" : ""}
            >
              {date?.getDate()}
              {date && isToday(date) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* Month Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 border border-green-500/30 rounded-lg bg-green-500/10">
            <div className="text-lg font-bold text-green-400">{workingDays}</div>
            <div className="text-xs text-gray-400">Working Days</div>
          </div>
          <div className="text-center p-3 border border-red-500/30 rounded-lg bg-red-500/10">
            <div className="text-lg font-bold text-red-400">{holidayDays}</div>
            <div className="text-xs text-gray-400">Holiday Days</div>
          </div>
          <div className="text-center p-3 border border-blue-500/30 rounded-lg bg-blue-500/10">
            <div className="text-lg font-bold text-blue-400">{weekendDaysCount}</div>
            <div className="text-xs text-gray-400">Weekend Days</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-300">Working Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-300">Weekends</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-300">Holidays</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
            <span className="text-gray-300">Holiday Periods</span>
          </div>
        </div>

        {/* Current Month Holidays */}
        {monthDays.some((date) => isHoliday(date) || isInHolidayPeriod(date)) && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-yellow-400 mb-2">Holidays This Month:</h4>
            <div className="space-y-1">
              {monthDays
                .filter((date) => isHoliday(date) || isInHolidayPeriod(date))
                .map((date, index) => (
                  <div key={index} className="text-sm text-gray-300">
                    <span className="font-medium">{date.getDate()}</span> - {getHolidayName(date)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
