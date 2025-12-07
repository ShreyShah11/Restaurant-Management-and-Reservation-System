"use client"

import { useEffect, useState } from "react"
import {
  Loader2,
  User,
  Calendar,
  Users,
  Phone,
  Mail,
  UtensilsCrossed,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Filter,
} from "lucide-react"
import { backend } from "@/config/backend"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toast } from "@/components/Toast"
import { useRouter } from "next/navigation"
import { useRestaurantData } from "@/store/restaurant"

type FilterStatus = "all" | "pending" | "payment pending" | "rejected" | "confirmed";


export default function RestaurantBookingsPage() {
  const router = useRouter()
  const { restaurant, bookings, setBookings, updateBookingStatus } = useRestaurantData()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<
    FilterStatus
  >("all")

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await backend.post("/api/v1/booking/get-bookings-by-restaurant")
        if (data.success) setBookings(data.data)
        else Toast.error("Failed to load bookings", { description: data.message })
      } catch {
        Toast.error("Error fetching bookings", { description: "Please try again later." })
      } finally {
        setLoading(false)
      }
    }

    if (restaurant?._id) fetchBookings()
  }, [restaurant, setBookings])

  // Change booking status (Accept / Reject)
  const handleChangeStatus = async (bookingID: string, newStatus: "payment pending" | "rejected") => {
    try {
      setProcessing(true)
      const { data } = await backend.post("/api/v1/booking/change-booking-status-for-restautant", {
        bookingID,
        newStatus,
      })

      if (data.success) {
        updateBookingStatus(bookingID, newStatus)
        if (newStatus === "rejected") {
          Toast.success("Booking rejected successfully")
        } else {
          Toast.success("Booking accepted - Payment pending")
        }
      } else {
        Toast.error("Failed to change status", { description: data.message })
      }
    } catch (error) {
      console.error(error)
      Toast.error("Error updating booking", { description: "Please try again later." })
    } finally {
      setProcessing(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedBookingId) {
      Toast.error("No booking selected")
      return
    }

    await handleChangeStatus(selectedBookingId, "rejected")
    setRejectDialogOpen(false)
    setSelectedBookingId(null)
  }

  const safeBookings = bookings ?? []

  const filteredBookings =
    filterStatus === "all"
      ? safeBookings
      : safeBookings.filter((b) => b.status.toLowerCase() === filterStatus)

  const getBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-700 border border-orange-300"
      case "payment pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case "confirmed":
        return "bg-green-100 text-green-700 border border-green-300"
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-300"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ===== Header + Filter ===== */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-semibold">All Bookings ({safeBookings.length})</h1>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["all", "pending", "payment pending", "rejected", "confirmed"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status as FilterStatus)}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* ===== Empty State ===== */}
        {safeBookings.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-background">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">No bookings yet.</p>
            <button
              onClick={() => router.push("/restaurant/dashboard")}
              className="text-sm text-primary underline"
            >
              Back to Dashboard
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No bookings found for "{filterStatus}" status.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((b, i) => (
              <Card key={i} className="shadow-md border rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4" /> {b.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> <span>{b.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> <span>{b.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> <span>{b.numberOfGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> <span>{new Date(b.bookingAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> <span className="capitalize">{b.category}</span>
                  </div>

                  {b.message && (
                    <p className="text-sm italic border-t pt-2 text-gray-500">“{b.message}”</p>
                  )}

                  {/* ===== Status & Actions ===== */}
                  <div className="pt-2 flex justify-between items-center">
                    <Badge
                      className={`text-base font-medium flex items-center gap-2 px-3 py-1 rounded-md ${getBadgeClasses(
                        b.status
                      )}`}
                    >
                      {b.status.toLowerCase() === "pending" && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </span>
                      )}
                      {b.status}
                    </Badge>

                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processing}
                          onClick={() => handleChangeStatus(b.bookingID, "payment pending")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processing}
                          onClick={() => {
                            setSelectedBookingId(b.bookingID)
                            setRejectDialogOpen(true)
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ===== Reject Confirmation Dialog ===== */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setSelectedBookingId(null)
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
