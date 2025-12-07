"use client"
import type React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import type { RestaurantSuper } from "@/store/restaurant"

interface RestaurantHeroProps {
  restaurant: RestaurantSuper
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps): React.ReactElement {
  const rating: number =
    restaurant.ratingsCount > 0 ? restaurant.ratingsSum / restaurant.ratingsCount : 0

  return (
    <div className="w-full">
      {/* Banner Image */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden rounded-lg md:rounded-xl">
        <Image
          src={restaurant.bannerURL || "/placeholder.svg"}
          alt={restaurant.restaurantName}
          fill
          className="object-cover"
          priority
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Logo, Name & Slogan Section (Below Banner) */}
      <div className="px-4 sm:px-6 md:px-8 mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-lg overflow-hidden bg-background shadow-md border border-border">
              <Image
                src={restaurant.logoURL || "/placeholder.svg"}
                alt={restaurant.restaurantName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Title & Slogan */}
          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {restaurant.restaurantName}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground italic mt-1">
              {restaurant.slogan}
            </p>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Rating Badge */}
              <Badge variant="secondary" className="text-xs sm:text-sm">
                ⭐ {rating.toFixed(1)} ({restaurant.ratingsCount} reviews)
              </Badge>

              {restaurant.status.isActive && (
                <Badge className="bg-green-600 text-white text-xs sm:text-sm">🟢 Active</Badge>
              )}

              {restaurant.status.temporarilyClosed && (
                <Badge className="bg-yellow-600 text-white text-xs sm:text-sm">
                  🟧 Temporarily Closed
                </Badge>
              )}

              {!restaurant.status.isActive && !restaurant.status.temporarilyClosed && (
                <Badge className="bg-red-600 text-white text-xs sm:text-sm">🔴 Closed</Badge>
              )}

              {restaurant.status.isVerified && (
                <Badge className="bg-blue-600 text-white text-xs sm:text-sm">✅ Verified</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
