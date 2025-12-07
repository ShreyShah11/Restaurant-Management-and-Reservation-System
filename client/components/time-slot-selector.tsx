"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { RestaurantFormData } from "@/lib/restaurant-schema"
import { Restaurant } from "@/store/restaurant-browse"

interface TimeSlotSelectorProps {
  restaurant: Restaurant
  selectedDate: Date
  selectedTime: string | null
  onTimeChange: (displayTime: string, time24: string) => void
}

type MealType = "breakfast" | "lunch" | "dinner"

interface MealSlots {
  [key: string]: { display: string; time24: string }[]
}

export default function TimeSlotSelector({
  restaurant,
  selectedDate,
  selectedTime,
  onTimeChange,
}: TimeSlotSelectorProps) {
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>("dinner")

  const timeSlots = useMemo(() => {
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6
    const openingHours = restaurant.openingHours

    const openTimeStr = isWeekend ? openingHours.weekendOpen : openingHours.weekdayOpen
    const closeTimeStr = isWeekend ? openingHours.weekendClose : openingHours.weekdayClose

    // ✅ Parse both ISO and "HH:MM"
    const parseTime = (timeStr: string) => {
      if (!timeStr) return { hour: 0, min: 0 }
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        return { hour: date.getHours(), min: date.getMinutes() }
      }
      const [h, m] = timeStr.split(":").map(Number)
      return { hour: h || 0, min: m || 0 }
    }

    const { hour: openHour, min: openMin } = parseTime(openTimeStr)
    const { hour: closeHour, min: closeMin } = parseTime(closeTimeStr)

    // ✅ Handle overnight (close next day)
    const openDate = new Date(selectedDate)
    openDate.setHours(openHour, openMin, 0, 0)

    const closeDate = new Date(selectedDate)
    closeDate.setHours(closeHour, closeMin, 0, 0)
    if (closeDate <= openDate) closeDate.setDate(closeDate.getDate() + 1)

    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()

    const slots: MealSlots = { breakfast: [], lunch: [], dinner: [] }
    let current = new Date(openDate)

    while (current < closeDate) {
      const displayTime = current.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      // ✅ Format backend-safe 24-hour time
      const hours24 = String(current.getHours()).padStart(2, "0")
      const minutes24 = String(current.getMinutes()).padStart(2, "0")
      const time24 = `${hours24}:${minutes24}`

      const hour = current.getHours()

      // ✅ Determine meal category
      let meal: MealType
      if (hour >= 0 && hour < 4) meal = "dinner"
      else if (hour >= 7 && hour < 11) meal = "breakfast"
      else if (hour >= 11 && hour < 17) meal = "lunch"
      else meal = "dinner"

      // ✅ Skip invalid past times
      let isValid = true
      if (isToday) {
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
        if (current < oneHourLater) isValid = false
        if (meal === "breakfast" && now.getHours() >= 11) isValid = false
      }

      if (isValid) slots[meal].push({ display: displayTime, time24 })
      current.setMinutes(current.getMinutes() + 30)
    }

    return slots
  }, [restaurant, selectedDate])

  const renderMealSection = (meal: MealType, icon: string, label: string) => {
    const slots = timeSlots[meal]
    if (slots.length === 0) return null

    const isExpanded = expandedMeal === meal

    return (
      <div key={meal} className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedMeal(isExpanded ? null : meal)}
          className="w-full px-4 py-3 flex items-center justify-between bg-background hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div className="text-left">
              <div className="font-semibold text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground">
                {slots[0].display} – {slots[slots.length - 1].display}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="grid grid-cols-3 gap-2 p-4 bg-muted/50">
            {slots.map((slot) => (
              <button
                key={slot.time24}
                onClick={() => onTimeChange(slot.display, slot.time24)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedTime === slot.display
                    ? "bg-orange-500 text-white"
                    : "bg-background border border-border text-foreground hover:border-primary"
                }`}
              >
                {slot.display}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 🕐 Fallback
  if (Object.values(timeSlots).every((arr) => arr.length === 0)) {
    return <p className="text-muted-foreground">No available time slots for the selected day.</p>
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-4">
        Select the time of day to see the slots
      </label>
      <div className="space-y-2">
        {renderMealSection("breakfast", "🌅", "Breakfast")}
        {renderMealSection("lunch", "🍽️", "Lunch")}
        {renderMealSection("dinner", "🌙", "Dinner")}
      </div>
    </div>
  )
}
