"use client"

import { Restaurant } from "@/store/restaurant-browse"
import { useState } from "react"

interface DateSelectorProps {
  restaurant: Restaurant
  selectedDate: Date | null
  onDateChange: (date: Date) => void
}

export default function DateSelector({ restaurant, selectedDate, onDateChange }: DateSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-4">When are you visiting?</label>
      <div className="grid grid-cols-4 gap-2 overflow-x-auto pb-2">
        {dates.map((date, idx) => (
          <button
            key={idx}
            onClick={() => onDateChange(date)}
            className={`p-3 rounded-lg transition-colors text-center ${
              selectedDate && selectedDate.toDateString() === date.toDateString()
                ? "bg-orange-500 text-white"
                : "bg-background border border-border text-foreground hover:border-primary"
            }`}
          >
            <div className="text-xs font-medium">{getDayName(date)}</div>
            <div className="text-sm font-semibold">{date.getDate()}</div>
            {isToday(date) && <div className="text-xs text-orange-600 font-medium">Today</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
