"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Image from "next/image"
import { MapPin, Clock, Star, ChevronRight, Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const parseTimeToToday = (timeStr: string): Date | null => {
  if (!timeStr) return null
  const looksIso = /\d{4}-\d{2}-\d{2}T/.test(timeStr)
  if (looksIso) return new Date(timeStr)

  const today = new Date()
  const dateStr = today.toDateString() + " " + timeStr
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

const formatDisplayTime = (timeStr: string): string => {
  if (!timeStr) return "-"
  if (/[\?]/.test(timeStr)) return timeStr
  const looksIso = /\d{4}-\d{2}-\d{2}T/.test(timeStr)
  const date = looksIso ? new Date(timeStr) : new Date("1970-01-01 " + timeStr)
  if (isNaN(date.getTime())) return timeStr
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
}


const isTimeWithinRange = (now: Date, open: Date, close: Date): boolean => {
  const toMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes()
  const nowMin = toMinutes(now)
  const openMin = toMinutes(open)
  const closeMin = toMinutes(close)

  if (closeMin > openMin) return nowMin >= openMin && nowMin <= closeMin
  return nowMin >= openMin || nowMin <= closeMin 
}


interface Restaurant {
  _id: string
  restaurantName: string
  logoURL: string
  bannerURL: string
  ratingsSum: number
  ratingsCount: number
  slogan: string
  address: {
    street: string
    city: string
  }
  openingHours: {
    weekdayOpen: string
    weekdayClose: string
    weekendOpen: string
    weekendClose: string
  }
  status: string
  temporarilyClosed?: boolean
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onViewDetails: (restaurantId: string) => void
  isListView: boolean
}


export function RestaurantCard({
  restaurant,
  onViewDetails,
  isListView,
}: RestaurantCardProps): React.ReactElement {
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const averageRating =
    restaurant.ratingsCount > 0 ? restaurant.ratingsSum / restaurant.ratingsCount : 0
  const deliveryTime = Math.floor(Math.random() * 30) + 20
  const today = new Date()
  const day = today.getDay()
  const isWeekend = day === 0 || day === 6

  const activeOpenStr = isWeekend
    ? restaurant.openingHours.weekendOpen
    : restaurant.openingHours.weekdayOpen
  const activeCloseStr = isWeekend
    ? restaurant.openingHours.weekendClose
    : restaurant.openingHours.weekdayClose

  const { isOpen, currentStatusText } = useMemo(() => {
    const now = new Date()
    const openTime = parseTimeToToday(activeOpenStr)
    const closeTime = parseTimeToToday(activeCloseStr)

    if (!openTime || !closeTime)
      return { isOpen: false, currentStatusText: "Closed (No hours set)" }

    const withinHours = isTimeWithinRange(now, openTime, closeTime)
    if (!withinHours)
      return { isOpen: false, currentStatusText: "Closed (Outside Hours)" }

    if (restaurant.temporarilyClosed)
      return { isOpen: false, currentStatusText: "Temporarily Closed" }

    return { isOpen: true, currentStatusText: "Open Now" }
  }, [activeOpenStr, activeCloseStr, restaurant.temporarilyClosed])

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const formattedWeekdayHours = `${formatDisplayTime(
    restaurant.openingHours.weekdayOpen
  )} - ${formatDisplayTime(restaurant.openingHours.weekdayClose)}`
  const formattedWeekendHours = `${formatDisplayTime(
    restaurant.openingHours.weekendOpen
  )} - ${formatDisplayTime(restaurant.openingHours.weekendClose)}`

  if (isListView) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="relative w-full sm:w-48 h-40 sm:h-32 bg-muted overflow-hidden rounded-lg shrink-0">
            <Image
              src={restaurant.bannerURL || "/placeholder.svg"}
              alt={restaurant.restaurantName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-800 overflow-hidden shadow-md">
              <Image
                src={restaurant.logoURL || "/placeholder.svg"}
                alt={`${restaurant.restaurantName} logo`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
                  {restaurant.restaurantName}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                  {restaurant.slogan}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleFavoriteToggle}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100 hover:bg-amber-50">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                {averageRating.toFixed(1)} ({restaurant.ratingsCount})
              </Badge>


              <Badge
                className={
                  isOpen
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {currentStatusText}
              </Badge>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="line-clamp-1">
                  {restaurant.address.street}, {restaurant.address.city}
                </span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="w-3 h-3 shrink-0 mt-0.5" />
                <div className="flex flex-col leading-tight">
                  <span>Weekday: {formattedWeekdayHours}</span>
                  <span>Weekend: {formattedWeekendHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative h-40 bg-muted overflow-hidden">
        <Image
          src={restaurant.bannerURL || "/placeholder.svg"}
          alt={restaurant.restaurantName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute top-3 left-3 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-800 overflow-hidden shadow-md">
          <Image
            src={restaurant.logoURL || "/placeholder.svg"}
            alt={`${restaurant.restaurantName} logo`}
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
            onClick={handleFavoriteToggle}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          <Badge
            className={
              isOpen
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }
          >
            {currentStatusText}
          </Badge>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-foreground truncate">
            {restaurant.restaurantName}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            {restaurant.slogan}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded text-xs sm:text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({restaurant.ratingsCount})</span>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {restaurant.address.street}, {restaurant.address.city}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col leading-tight">
              <span>Weekday: {formattedWeekdayHours}</span>
              <span>Weekend: {formattedWeekendHours}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onViewDetails(restaurant._id)}
          className="w-full mt-2 text-xs sm:text-sm h-8 sm:h-9"
          variant="outline"
        >
          View Details
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
        </Button>
      </div>
    </Card>
  )
}
