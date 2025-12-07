// components/reviews-section.tsx
"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Loader2, Star, MessageSquare, Filter } from "lucide-react";
import { backend } from "@/config/backend";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewDialog } from "@/components/review-dialog";
import { ReviewCard } from "@/components/review-card";
import { ReviewSummaryDialog } from "@/components/review-summary-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBrowseRestaurantStore,
  type Restaurant,
} from "@/store/restaurant-browse";
import { RestaurantFormData } from "@/lib/restaurant-schema";
import { RestaurantSuper } from "@/store/restaurant";

interface Review {
  name: string;
  content: string;
  rate: number;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  histogram: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface ReviewsSectionProps {
  restaurantId: string;
  userId: string;
  onReviewAdded?: () => Promise<void> | void;
}

type SortOption = "recent" | "highest" | "lowest";


const mapBackendRestaurantToStore = (
  backendRestaurant: RestaurantSuper,
  cityName: string,
  cuisinesList: string[]
): Restaurant => {
  const r = backendRestaurant;

  const street = [r.address?.line1, r.address?.line2, r.address?.line3]
    .filter(Boolean)
    .join(", ");

  return {
    _id: r._id,
    restaurantName: r.restaurantName,
    logoURL: r.logoURL || "/placeholder.svg",
    bannerURL: r.bannerURL || "/placeholder.svg",
    ratingsSum: r.ratingsSum ?? 0,
    ratingsCount: r.ratingsCount ?? 0,
    slogan: r.slogan ?? "",
    address: {
      street,
      city: cityName || r.address?.city || "Unknown",
      zip: r.address?.zip,
    },
    openingHours: {
      weekdayOpen: r.openingHours?.weekday?.start ?? "",
      weekdayClose: r.openingHours?.weekday?.end ?? "",
      weekendOpen: r.openingHours?.weekend?.start ?? "",
      weekendClose: r.openingHours?.weekend?.end ?? "",
    },
    status: r.status?.temporarilyClosed ? "closed" : "open",
    city: cityName || r.address?.city || "Unknown",
    cuisines: cuisinesList?.length ? cuisinesList : ["General"],
    temporarilyClosed: r.status?.temporarilyClosed ?? false,
    isOpen: !r.status?.temporarilyClosed,
  };
};

export function ReviewsSection({
  restaurantId,
  userId,
  onReviewAdded,
}: ReviewsSectionProps): React.ReactElement {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [histogram, setHistogram] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  // Fetch all reviews
  const fetchReviews = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { data } = await backend.post<ReviewsResponse>(
        "/api/v1/review/get-reviews",
        { restaurantID: restaurantId }
      );

      if (data.success) {
        setReviews(data.reviews);
        setHistogram(data.histogram);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Toast.error("Error loading reviews", {
          description: error.response?.data?.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  // After review is added
  const handleReviewAdded = async (): Promise<void> => {
    setIsDialogOpen(false);
    Toast.success("Review submitted!");

    // refresh reviews
    await fetchReviews();

    // refresh review count outside
    onReviewAdded && (await onReviewAdded());

    // refresh ALL RESTAURANTS globally in Zustand
    try {
      const { setRestaurants } = useBrowseRestaurantStore.getState();

      const { data } = await backend.post(
        "/api/v1/restaurants/get-near-by-restaurants",
        { maxDistance: 200000 }
      );

      if (data.success) {
        const refreshed = data.restaurants.map(
          ([restaurantObj, cityName, cuisinesList]: [any, string, string[]]) =>
            mapBackendRestaurantToStore(restaurantObj, cityName, cuisinesList)
        );

        setRestaurants(refreshed);
      }
    } catch (err) {
      console.error("Store refresh failed:", err);
    }
  };

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortOption) {
      case "highest":
        return sorted.sort((a, b) => b.rate - a.rate);
      case "lowest":
        return sorted.sort((a, b) => a.rate - b.rate);
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [reviews, sortOption]);

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select
            value={sortOption}
            onValueChange={(v: SortOption) => setSortOption(v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>

          <ReviewDialog
            restaurantId={restaurantId}
            userId={userId}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onReviewAdded={handleReviewAdded}
          />

          <Button
            variant="outline"
            onClick={() => setIsSummaryOpen(true)}
            disabled={reviews.length === 0}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Summarize
          </Button>
        </div>
      </div>

      {/* HISTOGRAM */}
      {Object.values(histogram).some((x) => x > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span>{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>

                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${
                        reviews.length > 0
                          ? (histogram[rating as keyof typeof histogram] /
                              reviews.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <span className="w-10 text-sm text-muted-foreground">
                  {histogram[rating as keyof typeof histogram]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* REVIEWS LIST */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : sortedReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            No reviews yet
          </CardContent>
        </Card>
      ) : (
        <div
          className="
            max-h-[550px]
            overflow-y-auto
            pr-2
            scrollbar-thin
            scrollbar-thumb-rounded-lg
            scrollbar-thumb-muted
            space-y-3
          "
        >
          {sortedReviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))}
        </div>
      )}

      <ReviewSummaryDialog
        isOpen={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        restaurantId={restaurantId}
      />
    </section>
  );
}