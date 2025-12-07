"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  CalendarDays,
  MessageCircle,
  Pencil,
  ChefHat,
  Star,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { backend } from "@/config/backend";
import { useRestaurantData } from "@/store/restaurant";
import { useUserData } from "@/store/user";
import { Toast } from "@/components/Toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { RestaurantSuper } from "@/store/restaurant";
import BookingAlert from "@/components/booking-alert";
import { RestaurantInfo } from "@/components/restaurant-info";
import { RestaurantAbout } from "@/components/restaurant-about";
import { RestaurantAddress } from "@/components/restaurant-address";
import { RestaurantActions } from "@/components/restaurant-actions";

interface RestaurantResponse {
  success: boolean;
  found: boolean;
  restaurant: RestaurantSuper | null;
  message: string;
}

export default function RestaurantDetailsPage(): React.ReactElement {
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const { restaurant, setRestaurant } = useRestaurantData();
  const { user } = useUserData();
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurant = async (): Promise<void> => {
      try {
        const { data } = await backend.post<RestaurantResponse>(
          "/api/v1/restaurants/get-restaurant-by-owner"
        );

        if (data.success && data.found && data.restaurant !== null) {
          setRestaurant(data.restaurant);
          setStatus("found");
        } else {
          setStatus("not-found");
        }
      } catch (error: unknown) {
        console.error("Error fetching restaurant:", error);

        if (axios.isAxiosError(error)) {
          const message: string =
            error.response?.data?.message ||
            "Unable to fetch restaurant details. Please try again.";
          Toast.error("Restaurant not found", { description: message });
        } else if (error instanceof Error) {
          Toast.error("Error Occurred", { description: error.message });
        } else {
          Toast.error("Unexpected Error", {
            description: "Something went wrong. Please try again later.",
          });
        }

        setStatus("not-found");
      }
    };

    if (user) {
      fetchRestaurant();
    }
  }, [user, setRestaurant]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "not-found" || restaurant === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-6 space-y-6 text-center">
  
          {/* Icon */}
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
  
          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground">
            Restaurant Profile Not Found
          </h2>
  
          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            You have not set up your restaurant profile yet.  
            Please complete your restaurant information so customers can find you online.
          </p>
  
          {/* Recommended Steps */}
          <div className="bg-muted/40 p-4 rounded-lg text-left space-y-2">
            <p className="text-sm font-medium text-foreground">What you can do now:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>Add restaurant details</li>
              <li>Upload banner & logo</li>
              <li>Describe your restaurant</li>
              <li>Set opening hours & address</li>
            </ul>
          </div>
  
          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/restaurant/set-restaurant")}
              className="w-full"
              size="lg"
            >
              Add Your Restaurant
            </Button>
          </div>
  
        </div>
      </div>
    );
  }
  

  const averageRating =
    restaurant.ratingsCount > 0
      ? (restaurant.ratingsSum / restaurant.ratingsCount).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 md:py-12">

        {/* ⭐ HERO SECTION */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-10 shadow-lg">
          <img
            src={restaurant.bannerURL}
            alt="Banner"
            className="w-full h-full object-cover"
          />

          {/* Bottom black blur */}
          <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />

          {/* Logo + Name + Ratings */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            <img
              src={restaurant.logoURL}
              alt="Logo"
              className="h-20 w-20 rounded-full border-2 border-white shadow-md"
            />

            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {restaurant.restaurantName}
              </h1>

              {/* ⭐ Ratings + Review Count */}
              {averageRating && (
                <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>{averageRating}</span>
                  <span className="text-white/80">
                    ({restaurant.ratingsCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ⭐ 4 BUTTONS ROW */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">

          <Button
            onClick={() =>
              router.push(`/restaurant/dashboard/reviews?restaurantID=${restaurant._id}`)
            }
            className="flex items-center gap-2 secondary"
          >
            <MessageCircle className="w-4 h-4" />
            View Reviews
          </Button>

          <Button
            onClick={() => router.push("/restaurant/update-restaurant")}
            className="flex items-center gap-2 secondary"
          >
            <Pencil className="w-4 h-4" />
            Update Restaurant
          </Button>

          <Button
            onClick={() => router.push("/restaurant/item-list")}
            className="flex items-center gap-2 secondary"
          >
            <ChefHat className="w-4 h-4" />
            Manage Menu
          </Button>

          <Button
            onClick={() => router.push("/restaurant/dashboard/bookings")}
            className="flex items-center gap-2 secondary"
          >
            <CalendarDays className="w-4 h-4" />
            View Bookings
          </Button>

          <Button
            onClick={() => router.push("/restaurant/dashboard/analytics")}
            className="flex items-center gap-2 secondary"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>

        {/* Rest Sections (unchanged) */}
        <div className="space-y-6 md:space-y-8">
          <RestaurantInfo restaurant={restaurant} />
          <RestaurantAbout about={restaurant.about} />
          <RestaurantAddress address={restaurant.address} />
          
          <BookingAlert restaurantId={restaurant._id} />
        </div>

      </div>
    </main>
  );
}
