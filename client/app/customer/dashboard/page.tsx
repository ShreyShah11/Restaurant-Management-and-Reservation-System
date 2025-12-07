"use client"

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from "react"
import { backend } from "@/config/backend"
import { useUserData } from "@/store/user"
import { useBrowseRestaurantStore } from "@/store/restaurant-browse"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Calendar,
  Users,
  UtensilsCrossed,
  AlertCircle,
  MapPin,
  Building2,
} from "lucide-react"
import { Toast } from "@/components/Toast"
import Image from "next/image"

export default function UserDashboardPage() {

  const router = useRouter();

  const { user, bookings, setBookings } = useUserData()
  const { getRestaurantById } = useBrowseRestaurantStore()
  const [loading, setLoading] = useState(true)

  // 🧭 Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await backend.post("/api/v1/booking/get-bookings-by-customer")
        if (data.success) {
          setBookings(data.data)
        } else {
          Toast.error("Failed to load bookings", { description: data.message })
        }
      } catch (error) {
        console.error(error)
        Toast.error("Error fetching bookings", { description: "Please try again later." })
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) fetchBookings()
  }, [user, setBookings])

  // 🧮 Derived Lists
  const upcoming = useMemo(
    () => bookings.filter((b) => new Date(b.bookingAt) > new Date() && b.status !== "rejected"),
    [bookings]
  )

  const past = useMemo(
    () => bookings.filter((b) => new Date(b.bookingAt) < new Date() && b.status !== "rejected"),
    [bookings]
  )

  const cancelled = useMemo(
    () => bookings.filter((b) => b.status === "rejected"),
    [bookings]
  )

  // 🎨 Status color helper
  const getStatusColor = (status: string) => {
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
        <p className="text-sm text-muted-foreground ml-2">Loading your dashboard...</p>
      </div>
    )
  }
   
   
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="flex items-center justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {user?.firstName} 👋
            </h1>
            <p className="text-muted-foreground">
              Here’s a summary of your dining experiences.
            </p>
          </div>
          <Button
            className='cursor-pointer mr-15'
            size="sm"
            onClick={() => {
            router.push('/customer/dashboard/profile');
            }}
          >
            Profile
          </Button>
        </div>


        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-semibold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-semibold text-green-600">{upcoming.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold text-blue-600">{past.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-semibold text-red-600">{cancelled.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-3 sm:w-[400px]">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          {[
            { key: "upcoming", data: upcoming, empty: "No upcoming bookings." },
            { key: "past", data: past, empty: "No past bookings found." },
            { key: "cancelled", data: cancelled, empty: "No cancelled bookings." },
          ].map(({ key, data, empty }) => (
            <TabsContent key={key} value={key} className="mt-6">
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  {empty}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.map((b, i) => {
                    const restaurant = getRestaurantById(b.restaurantID)
                    const bookingDate = new Date(b.bookingAt)
                    const formattedDate = bookingDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    const formattedTime = bookingDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })

                    return (
                      <Card
                        key={i}
                        className="border rounded-xl shadow-sm overflow-hidden group transition-all"
                      >
                        {restaurant?.bannerURL && (
                          <div className="relative h-36 w-full overflow-hidden">
                            <Image
                              src={restaurant.bannerURL}
                              alt={restaurant.restaurantName}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to- from-black/50 to-transparent"></div>
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4" />
                            {restaurant?.restaurantName || "Restaurant"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                          {restaurant && (
                            <>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span>{restaurant.slogan || "No slogan available"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{restaurant.address.street}, {restaurant.address.city}</span>
                              </div>
                            </>
                          )}

                          <div className="border-t pt-2 mt-2 space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Date:</span>
                              <span className="font-medium">{formattedDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Time:</span>
                              <span className="font-medium">{formattedTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Guests:</span>
                              <span className="font-medium">{b.numberOfGuests}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-between items-center">
                            <Badge
                              className={`text-base font-medium flex items-center gap-2 px-3 py-1 rounded-md ${getStatusColor(
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

                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  )
}
