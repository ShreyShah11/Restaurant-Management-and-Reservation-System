"use client"

import type React from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"

interface RestaurantsHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  location: string
  onLocationChange: (location: string) => void
}

export function RestaurantsHeader({
  searchQuery,
  onSearchChange,
  location,
  onLocationChange,
}: RestaurantsHeaderProps): React.ReactElement {
  return (
    <header className="
      bg-background  
      shadow-sm 
      backdrop-blur-sm 
      transition-colors 
      duration-300 
      mt-6
      max-w-6xl
      mx-auto
    ">
      <div className="container mx-auto px-4 py-4 lg:py-6 mt-16">
        <div className="space-y-3 lg:space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Browse Restaurants
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              Discover the best dining experiences
            </p>
          </div>

          {/* Search + Location Inputs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                className="pl-10 text-sm bg-white dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Location Input */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}
                className="pl-10 text-sm bg-white dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
