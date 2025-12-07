"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Loader2, AlertCircle } from "lucide-react"
import { backend } from "@/config/backend"
import { Toast } from "@/components/Toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewSummaryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
}

interface SummaryResponse {
  success: boolean
  summary: string
  message: string
}

export function ReviewSummaryDialog({
  isOpen,
  onOpenChange,
  restaurantId,
}: ReviewSummaryDialogProps): React.ReactElement {
  const [summary, setSummary] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string>("")

  const fetchSummary = async (): Promise<void> => {
    console.log("hi 1")
    if (hasLoaded || isLoading) return
    console.log("hi 2")

    try {
      setIsLoading(true)
      setError("")
      const { data } = await backend.post<SummaryResponse>("/api/v1/review/get-ai-summary", {
        restaurantID: restaurantId,
      })
      console.log("data", data)

      if (data.success) {
        setSummary(data.summary)
        setHasLoaded(true)
      } else {
        setError(data.message || "Failed to generate summary")
      }
    } catch (error: unknown) {
      console.error("Error fetching summary:", error)
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to generate summary")
      } else {
        setError("Failed to generate summary")
      }
      Toast.error("Error", { description: "Failed to generate summary" })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Trigger fetch only when dialog actually opens
  useEffect(() => {
    if (isOpen && !hasLoaded && !isLoading) {
      console.log("Dialog opened — calling fetchSummary()")
      fetchSummary()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Summary</DialogTitle>
          <DialogDescription>AI-generated summary of all reviews</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating summary...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
