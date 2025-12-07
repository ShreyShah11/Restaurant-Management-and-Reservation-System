"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface RestaurantAboutProps {
  about: string
}

export function RestaurantAbout({ about }: RestaurantAboutProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const isLong: boolean = about.length > 300
  const displayText: string = isExpanded || !isLong ? about : about.substring(0, 300) + "..."

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">About</h2>

      <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
        {displayText}
      </p>

      {isLong && (
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="mt-4">
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show More
            </>
          )}
        </Button>
      )}
    </Card>
  )
}
