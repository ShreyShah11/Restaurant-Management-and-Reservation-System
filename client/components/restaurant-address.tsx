"use client"

import type React from "react"
import { MapPin, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { RestaurantSuper } from "@/store/restaurant"
interface Address {
    line1: string
    line2: string
    line3: string
    zip: string
    city: string
    state: string
    country: string
  }
interface RestaurantAddressProps {
  address: Address
}

export function RestaurantAddress({ address }: RestaurantAddressProps): React.ReactElement {
  const fullAddress: string = [address.line1, address.line2, address.city, address.state, address.zip, address.country]
    .filter((part: string) => part && part.trim())
    .join(", ")

  const mapsUrl: string = `https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-foreground">Address</h2>

          <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap wrap-break-word mb-4">{fullAddress}</p>

          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto bg-transparent">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Map
            </a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
