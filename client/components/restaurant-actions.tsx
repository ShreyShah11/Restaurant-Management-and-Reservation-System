"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit3, UtensilsCrossed } from "lucide-react"

export function RestaurantActions(): React.ReactElement {
  const router = useRouter()

  const handleEditRestaurant = (): void => {
    router.push("/restaurant/update-restaurant")
  }

  const handleViewMenu = (): void => {
    router.push("/restaurant/item-list")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <Button onClick={handleEditRestaurant} className="flex-1" size="lg">
        <Edit3 className="h-4 w-4 mr-2" />
        Update Restaurant
      </Button>

      <Button onClick={handleViewMenu} variant="outline" className="flex-1 bg-transparent" size="lg">
        <UtensilsCrossed className="h-4 w-4 mr-2" />
        Manage Menu
      </Button>
    </div>
  )
}
