"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Loader2, Star } from "lucide-react"
import { backend } from "@/config/backend"
import { Toast } from "@/components/Toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReviewDialogProps {
  restaurantId: string
  userId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onReviewAdded: () => void
}

export function ReviewDialog({
  restaurantId,
  userId,
  isOpen,
  onOpenChange,
  onReviewAdded,
}: ReviewDialogProps): React.ReactElement {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    if (rating === 0) {
      Toast.error("Error", { description: "Please select a rating" })
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await backend.post("/api/v1/review/add-review", {
        restaurantID: restaurantId,
        rate: rating,
        content: content.trim(),
      })

      if (data.success) {
        Toast.success("Success", { description: "Review added successfully" })
        setRating(0)
        setContent("")
        onReviewAdded()
      }
    } catch (error: unknown) {
      console.error("Error adding review:", error)
      if (axios.isAxiosError(error)) {
        Toast.error("Error", { description: error.response?.data?.message || "Failed to add review" })
      } else {
        Toast.error("Error", { description: "Failed to add review" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = (): void => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Write Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with this restaurant</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                You selected {rating} star{rating !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Review (Optional)</Label>
            <Textarea
              id="review-content"
              placeholder="Share your experience... (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
