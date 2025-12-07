"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FilterState {
  cuisine: string
  category: string
  priceRange: [number, number]
  foodType: string
  search: string
}

interface ItemsFilterProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  cuisines: string[]
  categories: string[]
  foodTypes: Array<{ value: string; label: string }>
  maxPrice: number
}

export function ItemsFilter({ filters, onFilterChange, cuisines, categories, foodTypes, maxPrice }: ItemsFilterProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleResetFilters = (): void => {
    onFilterChange({
      cuisine: "",
      category: "",
      priceRange: [0, maxPrice],
      foodType: "",
      search: "",
    })
  }

  const isFiltered: boolean =
    filters.cuisine.length > 0 ||
    filters.category.length > 0 ||
    filters.foodType.length > 0 ||
    filters.search.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice

  const activeFilterCount: number = [
    filters.cuisine.length > 0 ? 1 : 0,
    filters.category.length > 0 ? 1 : 0,
    filters.foodType.length > 0 ? 1 : 0,
    filters.search.length > 0 ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0,
  ].reduce((sum: number, val: number) => sum + val, 0)

  return (
    <Card className="mb-8 border shadow-sm bg-linear-to-r from-card/50 to-card/30 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-accent/30 transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">Filter Items</span>
          {isFiltered && (
            <Badge variant="default" className="rounded-full px-2 py-0.5 bg-primary/90">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isOpen && (
        <CardContent className="border-t pt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Search Dish
              </Label>
              <Input
                id="search"
                placeholder="e.g., Biryani..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFilterChange({ ...filters, search: e.target.value })
                }
                className="h-9 bg-background/50"
              />
            </div>

            {/* Cuisine */}
            <div className="space-y-2">
              <Label htmlFor="cuisine" className="text-sm font-medium">
                Cuisine
              </Label>
              <Select
                value={filters.cuisine}
                onValueChange={(value: string) => onFilterChange({ ...filters, cuisine: value })}
              >
                <SelectTrigger id="cuisine" className="h-9 bg-background/50">
                  <SelectValue placeholder="All cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map((cuisine: string) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={filters.category}
                onValueChange={(value: string) => onFilterChange({ ...filters, category: value })}
              >
                <SelectTrigger id="category" className="h-9 bg-background/50">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Food Type */}
            <div className="space-y-2">
              <Label htmlFor="foodType" className="text-sm font-medium">
                Food Type
              </Label>
              <Select
                value={filters.foodType}
                onValueChange={(value: string) => onFilterChange({ ...filters, foodType: value })}
              >
                <SelectTrigger id="foodType" className="h-9 bg-background/50">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {foodTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              </Label>
              <Slider
                min={0}
                max={maxPrice}
                step={50}
                value={filters.priceRange}
                onValueChange={(value: number[]) =>
                  onFilterChange({
                    ...filters,
                    priceRange: [value[0], value[1]] as [number, number],
                  })
                }
                className="mt-2"
              />
            </div>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 bg-transparent hover:bg-destructive/5 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
