"use client"

import type React from "react"
import { Mail, Phone, Calendar, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { RestaurantSuper } from "@/store/restaurant"

interface RestaurantInfoProps {
  restaurant: RestaurantSuper
}

// Utility function to format ISO date → local time only
const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function RestaurantInfo({ restaurant }: RestaurantInfoProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Contact Information Card */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Contact Information</h2>

        <div className="space-y-3 sm:space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
              <a
                href={`mailto:${restaurant.restaurantEmail}`}
                className="text-sm sm:text-base text-primary hover:underline truncate"
              >
                {restaurant.restaurantEmail}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
              <a href={`tel:${restaurant.phoneNumber}`} className="text-sm sm:text-base text-primary hover:underline">
                {restaurant.phoneNumber}
              </a>
            </div>
          </div>

          {/* Since */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Since</p>
              <p className="text-sm sm:text-base font-medium">{restaurant.since}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Opening Hours Card */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">Opening Hours</h2>

        <div className="space-y-3 sm:space-y-4">
          {/* Weekdays */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Weekdays</p>
              <p className="text-sm sm:text-base font-medium">
                {formatTime(restaurant.openingHours.weekday.start)} – {formatTime(restaurant.openingHours.weekday.end)}
              </p>
            </div>
          </div>

          {/* Weekends */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Weekends</p>
              <p className="text-sm sm:text-base font-medium">
                {formatTime(restaurant.openingHours.weekend.start)} – {formatTime(restaurant.openingHours.weekend.end)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
