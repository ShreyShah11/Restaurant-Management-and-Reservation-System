"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Restaurant, RestaurantStore, useBrowseRestaurantStore } from "@/store/restaurant-browse"
import BookingForm from "@/components/booking-form"
import { ChevronLeft } from "lucide-react"
import { RestaurantSuper } from "@/store/restaurant"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const restaurantId = params.id as string
  const { getRestaurantById } = useBrowseRestaurantStore()
  const [restaurant, setRestaurant] = useState<Restaurant>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rest = getRestaurantById(restaurantId)
    if (rest) {
      setRestaurant(rest)
    }
    setLoading(false)
  }, [restaurantId, getRestaurantById])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
          <button onClick={() => router.back()} className="text-primary underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Book table</h1>
              <p className="text-sm text-muted-foreground">{restaurant.restaurantName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <BookingForm restaurant={restaurant} />
      </div>
    </div>
  )
}
