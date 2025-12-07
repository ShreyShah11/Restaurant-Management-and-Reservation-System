// app/customer/browse/[id]/page.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  Globe,
  Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewsSection } from "@/components/reviews-section";
import { useUserData } from "@/store/user";
import {
  useBrowseRestaurantStore,
  type Restaurant,
} from "@/store/restaurant-browse";
import { Button } from "@/components/ui/button";
import { backend } from "@/config/backend";
import MenuItemCard from "@/components/menuItemCardBrowse";

const formatTime = (timeStr: string): string => {
  if (!timeStr) return "N/A";
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${hours}:${formattedMinutes} ${period}`;
  } catch {
    return timeStr;
  }
};

type MenuItem = {
  _id: string;
  restaurantID: string;
  dishName: string;
  description?: string;
  cuisine?: string;
  ratingsSum?: number;
  ratingsCount?: number;
  foodType?: "veg" | "non-veg" | "vegan" | "egg";
  price: number;
  imageURL: string;
  isAvailable?: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function CustomerRestaurantDetailsPage(): React.ReactElement {
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<
    Record<string, Record<string, MenuItem[]>>
  >({});

  const { user } = useUserData();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const { getRestaurantById, restaurants } = useBrowseRestaurantStore();

  // LOAD RESTAURANT FROM STORE
  useEffect(() => {
    const found = getRestaurantById(restaurantId);

    if (found) {
      setRestaurant(found);
      setStatus("found");
    } else if (restaurants.length > 0) {
      setStatus("not-found");
      Toast.warning("Restaurant not found");
    } else {
      setStatus("not-found");
      Toast.warning("No restaurant data loaded. Open Browse page first.");
    }
  }, [restaurantId, restaurants, getRestaurantById]);

  // FETCH REVIEW COUNT
  const fetchReviewsCount = async () => {
    try {
      setRefreshing(true);
      const { data } = await backend.post("/api/v1/review/get-reviews", {
        restaurantID: restaurantId,
      });

      if (data.success) {
        setReviewsCount(data.reviews?.length || 0);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchReviewsCount();
  }, [restaurantId]);

  // FETCH MENU
  const fetchMenu = async () => {
    try {
      setMenuLoading(true);
      const resp = await backend.post("/api/v1/restaurants/get-items-by-restaurant", {
        restaurantID: restaurantId,
      });

      if (!resp.data.success) {
        setMenuError(resp.data.message);
        return;
      }

      const items: MenuItem[] = resp.data.items || [];
      const grouped: Record<string, Record<string, MenuItem[]>> = {};

      items.forEach((item) => {
        const cuisine = item.cuisine?.trim() || "Other";
        const category = item.category?.trim() || "Other";

        if (!grouped[cuisine]) grouped[cuisine] = {};
        if (!grouped[cuisine][category]) grouped[cuisine][category] = [];

        grouped[cuisine][category].push(item);
      });

      setGroupedMenu(grouped);
    } catch (err) {
      setMenuError("Failed to load menu.");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) fetchMenu();
  }, [restaurantId]);

  // HANDLING PAGE STATUS
  if (status === "loading") {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (status === "not-found" || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Alert variant="destructive">
          <AlertDescription>Restaurant Not Found</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/browse")}>
          <ArrowLeft className="mr-2" /> Back to Browse
        </Button>
      </div>
    );
  }

  const avgRating =
    restaurant.ratingsCount > 0
      ? (restaurant.ratingsSum / restaurant.ratingsCount).toFixed(1)
      : "No ratings";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Banner */}
        <div className="rounded-lg overflow-hidden h-64 relative mb-6">
          <img
            src={restaurant.bannerURL}
            className="w-full h-full object-cover"
            alt={restaurant.restaurantName}
          />

          {/* Strong black gradient for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />

          <div className="absolute bottom-0 w-full p-4">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              {restaurant.restaurantName}
            </h1>

            <p className="flex items-center gap-2 text-white/90 drop-shadow-lg">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {avgRating} ({reviewsCount} reviews)
            </p>
          </div>
        </div>
        {/* Reserve Table Button */}
<div className="flex justify-center mb-8">
  <Button
    size="lg"
    onClick={() => router.push(`/customer/browse/${restaurantId}/booking`)}
    className="px-6 py-5 text-lg font-medium"
  >
    Reserve Table
  </Button>
</div>


        {/* Menu */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Menu</h2>

          {menuLoading && <Loader2 className="animate-spin" />}
          {menuError && (
            <Alert variant="destructive">
              <AlertDescription>{menuError}</AlertDescription>
            </Alert>
          )}

          {!menuLoading &&groupedMenu?
            Object.entries(groupedMenu).map(([cuisine, categories]) => (
              <div key={cuisine} className="mb-8">
                <h3 className="text-xl font-semibold mb-3">{cuisine}</h3>

                {Object.entries(categories).map(([category, items]) => (
                  <Card key={category} className="mb-4">
                    <CardHeader>
                      <CardTitle>{category}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                        {items.map((item) => (
                          <div key={item._id} className="min-w-[220px]">
                            <MenuItemCard item={item} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )):<h3>No Menu Available</h3>}
        </section>

        {/* Info Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Address
              </CardTitle>
            </CardHeader>

            <CardContent className="flex justify-between">
              <p className="text-muted-foreground">
                {restaurant.address.street}, {restaurant.address.city}
                {restaurant.address.zip ? ` (${restaurant.address.zip})` : ""}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const q = encodeURIComponent(
                    `${restaurant.address.street}, ${restaurant.address.city} ${
                      restaurant.address.zip ?? ""
                    }`
                  );
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${q}`,
                    "_blank"
                  );
                }}
              >
                View on Map
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Opening Hours
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                <strong>Weekday:</strong>{" "}
                {formatTime(restaurant.openingHours.weekdayOpen)} –{" "}
                {formatTime(restaurant.openingHours.weekdayClose)}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Weekend:</strong>{" "}
                {formatTime(restaurant.openingHours.weekendOpen)} –{" "}
                {formatTime(restaurant.openingHours.weekendClose)}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          {user && (
            <ReviewsSection
              restaurantId={restaurant._id}
              userId={user._id}
              onReviewAdded={fetchReviewsCount}
            />
          )}
        </div>
      </div>
    </main>
  );
}
