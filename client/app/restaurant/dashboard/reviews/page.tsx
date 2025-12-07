"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backend } from "@/config/backend";
import { Toast } from "@/components/Toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Sparkles } from "lucide-react";

type Review = {
  name: string;
  content: string;
  rate: number;
  createdAt: string; // backend-formatted "14 November 2025"
};

type ReviewsResponse = {
  success: boolean;
  reviews: Review[];
  histogram: { 1: number; 2: number; 3: number; 4: number; 5: number };
};

export default function OwnerReviewsPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const restaurantID = searchParams.get("restaurantID");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [histogram, setHistogram] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const [loading, setLoading] = useState(true);

  // Filters / Sorting
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [daysFilter, setDaysFilter] = useState<"7" | "30" | "90" | "all">("all");

  // Summary dialog state
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // Fetch reviews from backend
  const fetchReviews = async (): Promise<void> => {
    if (!restaurantID) return;
    try {
      setLoading(true);
      const { data } = await backend.post<ReviewsResponse>(
        "/api/v1/review/get-reviews",
        { restaurantID }
      );

      if (data.success) {
        setReviews(data.reviews ?? []);
        setHistogram(data.histogram ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      } else {
        Toast.error("Failed to load reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      Toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantID) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantID]);

  // Parse date strings of format "14 November 2025"
  const parseDDMonthYYYY = (s: string): number | null => {
    if (!s) return null;
    const trimmed = s.trim();
    // Regex to capture day, month name, year (e.g., "14 November 2025")
    const m = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (m) {
      const day = Number(m[1]);
      const monthName = m[2].toLowerCase();
      const year = Number(m[3]);

      const months: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        sept: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };

      const monthIdx =
        months[monthName as keyof typeof months] ?? Number.NaN;

      if (!Number.isNaN(monthIdx)) {
        const dt = new Date(year, monthIdx, day);
        if (!isNaN(dt.getTime())) return dt.getTime();
      }
    }

    // Fallback: try Date.parse which can handle "November 14, 2025" or other locales
    const ts = Date.parse(trimmed);
    if (!isNaN(ts)) return ts;

    // Final fallback: new Date(...)
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.getTime();
    return null;
  };

  const parseReviewDate = (createdAt: string): number | null => {
    // We expect format "14 November 2025" - parse accordingly
    const ts = parseDDMonthYYYY(createdAt);
    return ts;
  };

  const getCutoffTimestamp = (filter: typeof daysFilter): number | null => {
    if (filter === "all") return null;
    const days = Number(filter);
    if (isNaN(days) || days <= 0) return null;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  };

  const cutoffTs = getCutoffTimestamp(daysFilter);

  // Apply client-side filtering and sorting
  const filteredAndSorted = useMemo(() => {
    let list = reviews.slice();

    if (cutoffTs !== null) {
      list = list.filter((r) => {
        const ts = parseReviewDate(r.createdAt);
        return ts !== null ? ts >= cutoffTs : false;
      });
    }

    switch (sortOption) {
      case "newest":
        list.sort((a, b) => {
          const ta = parseReviewDate(a.createdAt) ?? 0;
          const tb = parseReviewDate(b.createdAt) ?? 0;
          return tb - ta;
        });
        break;
      case "oldest":
        list.sort((a, b) => {
          const ta = parseReviewDate(a.createdAt) ?? 0;
          const tb = parseReviewDate(b.createdAt) ?? 0;
          return ta - tb;
        });
        break;
      case "highest":
        list.sort((a, b) => b.rate - a.rate);
        break;
      case "lowest":
        list.sort((a, b) => a.rate - b.rate);
        break;
    }

    return list;
  }, [reviews, sortOption, cutoffTs]);

  // Fetch AI summary and open dialog
  const handleGetSummary = async (): Promise<void> => {
    if (!restaurantID) return;
    try {
      setSummaryLoading(true);
      setSummaryText("");
      setSummaryDialogOpen(true);

      const { data } = await backend.post("/api/v1/review/get-ai-summary", {
        restaurantID,
      });

      if (data.success) {
        setSummaryText(data.summary ?? "No summary returned.");
      } else {
        setSummaryText("Failed to generate summary.");
      }
    } catch (err) {
      console.error("Error generating AI summary:", err);
      setSummaryText("Error generating summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header + controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"} total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Days filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Show:</label>
              <select
                value={daysFilter}
                onChange={(e) =>
                  setDaysFilter(e.target.value as "7" | "30" | "90" | "all")
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Sort:</label>
              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(
                    e.target.value as "newest" | "oldest" | "highest" | "lowest"
                  )
                }
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Summary button */}
            <Button
              className="flex items-center gap-2 bg-primary text-white"
              onClick={handleGetSummary}
              disabled={summaryLoading}
            >
              {summaryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SparklesIcon />
              )}
              Get Summary
            </Button>
          </div>
        </div>

        {/* Summary Dialog */}
        <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI Review Summary</DialogTitle>
              <DialogDescription>
                A concise summary generated from customer reviews.
              </DialogDescription>
            </DialogHeader>

            {summaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto p-2 text-sm whitespace-pre-line text-muted-foreground">
                {summaryText || "No summary available."}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>

                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        reviews.length
                          ? (histogram[rating as keyof typeof histogram] /
                              reviews.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <span className="text-sm text-muted-foreground w-12 text-right">
                  {histogram[rating as keyof typeof histogram]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reviews list */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No reviews match the selected filters.
              </p>
            ) : (
              filteredAndSorted.map((review, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{review.name}</h3>
                    <span className="flex items-center gap-1 text-sm">
                      {review.rate}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>

                  {review.content ? (
                    <p className="text-muted-foreground text-sm">{review.content}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      (No written review)
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground text-right">
                    {review.createdAt}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

/* small Sparkles wrapper to avoid extra import juggling */
function SparklesIcon(): React.ReactElement {
  return <Sparkles className="h-4 w-4" />;
}
