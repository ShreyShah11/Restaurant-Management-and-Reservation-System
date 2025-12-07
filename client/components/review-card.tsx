"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Review {
  name: string
  content: string
  rate: number
  createdAt: string
}

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-foreground">{initials}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{review.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            {/* Rating stars */}
            <div className="flex items-center gap-1 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rate ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {review.content && <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>}

          {/* Rating badge for text-only reviews */}
          {!review.content && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
              <span className="text-xs font-medium">{review.rate}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
