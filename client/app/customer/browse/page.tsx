"use client";

import type React from "react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RestaurantCard } from "@/components/restaurant-browse-card";
import { RestaurantsFilter, type RestaurantFilters } from "@/components/restaurants-filter";
import { RestaurantsHeader } from "@/components/restaurants-browse-header";
import { ViewToggle } from "@/components/layout-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { backend } from "@/config/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/Toast";
import { AxiosError } from "axios";
import { useBrowseRestaurantStore, type Restaurant } from "@/store/restaurant-browse";
import { RestaurantFormData } from "@/lib/restaurant-schema";
import { RestaurantSuper } from "@/store/restaurant";

// ---------- Helpers ----------
const parseTimeToToday = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  try {
    if (timeStr.includes("T")) {
      const utcDate = new Date(timeStr);
      const today = new Date();
      today.setHours(utcDate.getHours(), utcDate.getMinutes(), 0, 0);
      return today;
    }

    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (period) {
      period = period.toUpperCase();
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
    }
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  } catch (e) {
    console.error("parseTimeToToday error:", e, "input:", timeStr);
    return null;
  }
};

const isTimeWithinRange = (now: Date, open: Date, close: Date): boolean => {
  const toMin = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const n = toMin(now);
  const o = toMin(open);
  const c = toMin(close);
  return c > o ? n >= o && n <= c : n >= o || n <= c;
};

const isRestaurantOpenNow = (
  openingHours: {
    weekdayOpen: string;
    weekdayClose: string;
    weekendOpen: string;
    weekendClose: string;
  },
  temporarilyClosed?: boolean
): boolean => {
  if (temporarilyClosed) return false;
  const today = new Date();
  const day = today.getDay();
  const isWeekend = day === 0 || day === 6;
  const openStr = isWeekend ? openingHours.weekendOpen : openingHours.weekdayOpen;
  const closeStr = isWeekend ? openingHours.weekendClose : openingHours.weekdayClose;
  const open = parseTimeToToday(openStr);
  const close = parseTimeToToday(closeStr);
  if (!open || !close) return false;
  const now = new Date();
  return isTimeWithinRange(now, open, close);
};

type Tuple = [
  RestaurantSuper,          // backendRestaurant
  string | null,    // city
  string[] | null   // cuisines
];

// ---------- Skeleton ----------
function RestaurantCardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// ---------- Page ----------
export default function RestaurantsPage(): React.ReactElement {
  const router = useRouter();
  const { restaurants, setRestaurants, clearRestaurants } = useBrowseRestaurantStore();

  const [filters, setFilters] = useState<RestaurantFilters>({
    cuisines: [],
    minRating: 0,
    maxPrice: 100,
    distance: 200,
    isOpen: false,
    searchQuery: "",
  });
  const [location, setLocation] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- Fetch ----------
  const fetchRestaurants = async (distance?: number): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await backend.post("/api/v1/restaurants/get-near-by-restaurants", {
        maxDistance: (distance ?? filters.distance) * 1000,
      });

      if (response.data.success && response.data.restaurants.length > 0) {
        const mapped: Restaurant[] = response.data.restaurants.map((entry: Tuple) => {
          const [backendRestaurant, city, cuisines] = entry;
          console.log("entry",backendRestaurant)
          const r = backendRestaurant;
          const openNow = isRestaurantOpenNow(
            {
              weekdayOpen: r.openingHours.weekday.start,
              weekdayClose: r.openingHours.weekday.end,
              weekendOpen: r.openingHours.weekend.start,
              weekendClose: r.openingHours.weekend.end,
            },
            r.status.temporarilyClosed
          );

          return {
            _id: r._id,
            restaurantName: r.restaurantName,
            logoURL: r.logoURL || "/placeholder.svg",
            bannerURL: r.bannerURL || "/placeholder.svg",
            ratingsSum: r.ratingsSum ?? 0,
            ratingsCount: r.ratingsCount ?? 0,
            slogan: r.slogan ?? "",
            address: {
              street: `${r.address.line1 || ""}, ${r.address.line2 || ""}`.trim(),
              city: city || r.address.city || "Unknown",
              zip : backendRestaurant.address.zip,
            },
            openingHours: {
              weekdayOpen: r.openingHours.weekday.start,
              weekdayClose: r.openingHours.weekday.end,
              weekendOpen: r.openingHours.weekend.start,
              weekendClose: r.openingHours.weekend.end,
            },
            status: openNow ? "open" : "closed",
            city: city || r.address.city || "Unknown",
            cuisines: cuisines?.length ? cuisines : ["General"],
            temporarilyClosed: r.status.temporarilyClosed,
            isOpen: openNow,
          };
        });

        setRestaurants(mapped);
        setCuisineOptions([...new Set(mapped.flatMap((r) => r.cuisines))]);
      } else {
        clearRestaurants();
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message || "Failed to load restaurants.";
      setError(msg);
      Toast.error("Error", { description: msg });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (restaurants.length === 0) fetchRestaurants();
    else {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [restaurants.length]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchRestaurants(filters.distance);
    }, 1000);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [filters.distance]);

  // ---------- Filter ----------
  const filteredRestaurants = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;

    return restaurants.filter((r) => {
      const searchQuery = filters.searchQuery.toLowerCase();
      const searchMatch =
        r.restaurantName.toLowerCase().includes(searchQuery) ||
        r.slogan.toLowerCase().includes(searchQuery) ||
        r.cuisines.some((c) => c.toLowerCase().includes(searchQuery));

      const cuisineMatch =
        filters.cuisines.length === 0 ||
        filters.cuisines.some((f) =>
          r.cuisines.some((rc) => rc.toLowerCase().includes(f.toLowerCase()))
        );

      const locationMatch = !location || r.city.toLowerCase().includes(location.toLowerCase());
      const rating = r.ratingsCount > 0 ? r.ratingsSum / r.ratingsCount : 0;
      const ratingMatch =
        filters.minRating === 0 ||
        (filters.minRating === -1 ? rating <= 3.5 : rating >= filters.minRating);

      const openStr = isWeekend ? r.openingHours.weekendOpen : r.openingHours.weekdayOpen;
      const closeStr = isWeekend ? r.openingHours.weekendClose : r.openingHours.weekdayClose;
      const open = parseTimeToToday(openStr);
      const close = parseTimeToToday(closeStr);
      const isOpenNow = open && close && isTimeWithinRange(now, open, close) && !r.temporarilyClosed;
      const statusMatch = !filters.isOpen || isOpenNow;

      return searchMatch && cuisineMatch && locationMatch && ratingMatch && statusMatch;
    });
  }, [filters, location, restaurants]);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-background">
      <RestaurantsHeader
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters({ ...filters, searchQuery: q })}
        location={location}
        onLocationChange={setLocation}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-4 transition-all duration-300">
        <div className="flex gap-4">
          {/* Sidebar */}
          <div
            className={`fixed left-0 top-0 h-full z-10 w-64 bg-background border-r overflow-y-auto transform transition-transform lg:static lg:w-64 lg:transform-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold text-sm">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <RestaurantsFilter
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() =>
                  setFilters({
                    cuisines: [],
                    minRating: 0,
                    maxPrice: 100,
                    distance: 200,
                    isOpen: false,
                    searchQuery: "",
                  })
                }
                cuisineOptions={cuisineOptions}
              />
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <Button onClick={() => setSidebarOpen(true)} variant="outline" className="lg:hidden">
                <Menu className="w-4 h-4 mr-2" /> Filters
              </Button>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {loading && initialLoading ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredRestaurants.map((r) => (
                  <RestaurantCard
                    key={r._id}
                    restaurant={r}
                    // ✅ Passing restaurant._id only (no userId confusion)
                    onViewDetails={(restaurantId: string) =>
                      router.push(`/customer/browse/${restaurantId}`)
                    }
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No restaurants found.</p>
                <Button
                  onClick={() =>
                    setFilters({
                      cuisines: [],
                      minRating: 0,
                      maxPrice: 100,
                      distance: 200,
                      isOpen: false,
                      searchQuery: "",
                    })
                  }
                  variant="outline"
                  className="mt-3"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
