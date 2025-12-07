"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"
import { Toast } from "@/components/Toast"
import GuestSelector from "@/components/guest-selector"
import DateSelector from "@/components/date-selector"
import TimeSlotSelector from "@/components/time-slot-selector"
import { PhoneInput } from "@/components/phone-input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { backend } from "@/config/backend"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Restaurant } from "@/store/restaurant-browse"

interface BookingFormProps {
  restaurant: Restaurant
}

export default function BookingForm({ restaurant }: BookingFormProps) {
  const router = useRouter()

  const [guests, setGuests] = useState(2)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTime24, setSelectedTime24] = useState<string | null>(null)
  const [category, setCategory] = useState<"breakfast" | "lunch" | "dinner" | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState({ countryCode: "+91", phone: "" })
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  const handleTimeChange = (displayTime: string, time24: string) => {
    setSelectedTime(displayTime)
    setSelectedTime24(time24)

    const hour = parseInt(time24.split(":")[0])
    if (hour >= 7 && hour < 11) setCategory("breakfast")
    else if (hour >= 11 && hour < 17) setCategory("lunch")
    else setCategory("dinner")
  }

  const handleProceed = async () => {
    if (!selectedDate || !selectedTime24 || !category) {
      Toast.warning("Incomplete Booking Details", {
        description: "Please select a valid date and time.",
      })
      return
    }

    if (phone.phone.length !== 10) {
      Toast.warning("Invalid Phone Number", {
        description: "Please enter a valid 10-digit phone number.",
      })
      return
    }

    setIsLoading(true)

    try {
      // ✅ Create full ISO datetime for backend
      const [hour, minute] = selectedTime24.split(":").map(Number)
      const bookingDateTime = new Date(selectedDate)
      bookingDateTime.setHours(hour, minute, 0, 0)

      const payload = {
        restaurantID: restaurant._id,
        bookingAt: bookingDateTime.toISOString(),
        numberOfGuests: guests,
        message: message.trim() || "",
        category,
        phoneNumber: phone.phone,
      }

      const response = await backend.post("/api/v1/booking/create-booking", payload)

      if (response.data?.success) {
        setSuccessDialogOpen(true)
      } else {
        Toast.success("Booking Created", {
          description: "Booking created successfully, but no success flag returned.",
        })
        router.push(`/customer/dashboard`)
      }
    } catch (error: unknown) {
      console.error("Booking error:", error)
      const err = error as AxiosError<{ message: string }>

      if (err.response?.data?.message) {
        Toast.error("Booking Failed", {
          description: err.response.data.message,
        })
      } else if (err.message) {
        Toast.error("Error Creating Booking", {
          description: err.message,
        })
      } else {
        Toast.error("Unexpected Error", {
          description: "Please try again later or contact support.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Main Booking Form */}
      <div className="space-y-6 pb-8">
        {/* 👥 Guest Selector */}
        <Card className="p-6">
          <GuestSelector guests={guests} onGuestsChange={setGuests} />
        </Card>

        {/* 📅 Date & Time */}
        <Card className="p-6 space-y-4">
          <DateSelector
            restaurant={restaurant}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />

          {selectedDate && (
            <TimeSlotSelector
              restaurant={restaurant}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onTimeChange={handleTimeChange}
            />
          )}
        </Card>

        {/* 📞 Phone Number */}
        <Card className="p-6">
          <PhoneInput
            label="Contact Number"
            value={phone}
            onChange={setPhone}
            required
          />
        </Card>

        {/* 💬 Message */}
        <Card className="p-6">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Special occasion or message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Birthday celebration, anniversary, casual dining..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </Card>

        {/* ✅ Submit Button */}
        <Button
          onClick={handleProceed}
          disabled={!selectedDate || !selectedTime || isLoading}
          className="w-full h-12 text-base font-semibold"
        >
          {isLoading ? "Processing..." : "Proceed"}
        </Button>
      </div>

      {/* ✅ Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-foreground">
              Booking Request Sent
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              <div className="flex flex-col items-center justify-center space-y-2">
                <p>Your booking request has been sent to the restaurant manager.</p>
                <p>
                  You will receive a confirmation email soon on your registered
                  email address.
                </p>
                <p>
                  You can also check your booking status in your{" "}
                  <span className="font-medium text-foreground">Dashboard</span>.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-center mt-6">
            <Button
              onClick={() => {
                setSuccessDialogOpen(false)
                router.push("/customer/dashboard")
              }}
              className="w-full sm:w-auto"
            >
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
