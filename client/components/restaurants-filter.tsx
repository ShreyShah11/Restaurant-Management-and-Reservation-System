"use client"

import type React from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

export interface RestaurantFilters {
  cuisines: string[]
  minRating: number // 0 = none, -1 = below 3.5
  maxPrice: number
  distance: number
  isOpen: boolean
  searchQuery: string
}

interface RestaurantsFilterProps {
  filters: RestaurantFilters
  onFiltersChange: (filters: RestaurantFilters) => void
  onReset: () => void
  cuisineOptions: string[]
}

export function RestaurantsFilter({
  filters,
  onFiltersChange,
  onReset,
  cuisineOptions,
}: RestaurantsFilterProps): React.ReactElement {
  const handleCuisineChange = (cuisine: string, checked: boolean): void => {
    const updatedCuisines = checked
      ? [...filters.cuisines, cuisine]
      : filters.cuisines.filter((c) => c !== cuisine)

    onFiltersChange({
      ...filters,
      cuisines: updatedCuisines,
    })
  }

  const handleRatingChange = (rating: number): void => {
    // ✅ Toggle logic: clicking same rating again removes it
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === rating ? 0 : rating,
    })
  }

  const handleDistanceChange = (distance: number[]): void => {
    onFiltersChange({
      ...filters,
      distance: distance[0],
    })
  }

  const handleOpenNowChange = (checked: boolean): void => {
    onFiltersChange({
      ...filters,
      isOpen: checked,
    })
  }

  // ✅ Fixed: Also check for -1 (3.5 & below)
  const hasActiveFilters =
    filters.cuisines.length > 0 ||
    filters.minRating !== 0 || // <-- covers both positive and -1
    filters.distance < 100 ||
    filters.isOpen

  return (
    <div className="space-y-6">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            onClick={onReset}
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/80"
          >
            <X className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {/* 🥘 Cuisines */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Cuisines</h4>
            <div className="space-y-2">
              {cuisineOptions.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={cuisine}
                    checked={filters.cuisines.includes(cuisine)}
                    onCheckedChange={(checked) =>
                      handleCuisineChange(cuisine, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={cuisine}
                    className="text-sm cursor-pointer font-medium leading-none"
                  >
                    {cuisine}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ⭐ Ratings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Minimum Rating</h4>
            <div className="space-y-2">
              {[5, 4.5, 4, 3.5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.minRating === rating}
                    onCheckedChange={() => handleRatingChange(rating)}
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="text-sm cursor-pointer font-medium"
                  >
                    {rating}+ Stars
                  </label>
                </div>
              ))}

              {/* 3.5 & Below */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rating-below"
                  checked={filters.minRating === -1}
                  onCheckedChange={() =>
                    onFiltersChange({
                      ...filters,
                      minRating: filters.minRating === -1 ? 0 : -1,
                    })
                  }
                />
                <label
                  htmlFor="rating-below"
                  className="text-sm cursor-pointer font-medium"
                >
                  3.5 & below
                </label>
              </div>
            </div>
          </div>

          {/* 📍 Distance */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Distance (km)</h4>
            <div className="space-y-2">
              <Slider
                value={[filters.distance]}
                onValueChange={handleDistanceChange}
                max={200}
                min={0}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Up to {filters.distance} km
              </p>
            </div>
          </div>

          {/* ⏰ Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Status</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="open-now"
                checked={filters.isOpen}
                onCheckedChange={handleOpenNowChange}
              />
              <label
                htmlFor="open-now"
                className="text-sm cursor-pointer font-medium"
              >
                Open Now
              </label>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
