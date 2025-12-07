"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { backend } from "@/config/backend";
import env from "@/config/env";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

interface DailySalesRow {
  date: string; // YYYY-MM-DD
  bookings: number;
  guests: number;
  breakfast?: { bookings: number; guests: number };
  lunch?: { bookings: number; guests: number };
}

interface DailySalesResponse {
  success: boolean;
  data: DailySalesRow[];
}

interface ForecastRow {
  day: number;
  guests: number;
  date: string;
}

interface ForecastResponse {
  success: boolean;
  horizon: number;
  window: number;
  forecast: ForecastRow[];
}

type FunnelCounts = {
  pending: number;
  accepted: number;
  paymentPending: number;
  confirmed: number;
  executed: number;
  rejected: number;
};

interface FunnelResponse {
  success: boolean;
  data: { counts: FunnelCounts; conversions: Record<string, number> };
}

interface CategoryPerfRow {
  category: "breakfast" | "lunch" | "dinner" | string;
  bookings: number;
  guests: number;
  avgPartySize: number;
}

interface CategoryPerfResponse {
  success: boolean;
  data: CategoryPerfRow[];
}

interface HeatCell { weekday: number; hour: number; count: number }
interface HeatmapResponse { success: boolean; data: HeatCell[] }

interface CompareResponse {
  success: boolean;
  days: number;
  current: { bookings: number; guests: number };
  previous: { bookings: number; guests: number };
  growth: { bookings: number; guests: number };
  diff: { bookings: number; guests: number };
}

export default function RestaurantAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailySalesRow[]>([]);
  const [forecast, setForecast] = useState<ForecastRow[]>([]);
  const [funnel, setFunnel] = useState<FunnelResponse["data"] | null>(null);
  const [catPerf, setCatPerf] = useState<CategoryPerfRow[]>([]);
  const [heatmap, setHeatmap] = useState<HeatCell[]>([]);
  const [compare, setCompare] = useState<CompareResponse | null>(null);

  // Controls
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);
  const [compareDays, setCompareDays] = useState<7 | 30>(7);
  const [dateError, setDateError] = useState<string>("");

  // Format date for display
  const formatDate = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, 'dd/MM/yyyy');
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, 'yyyy-MM-dd');
  };

  // Helper function to validate from/to dates
  const validateDateRange = (fromDate: Date | undefined, toDate: Date | undefined): boolean => {
    if (!fromDate || !toDate) return true;
    
    // Check if dates are valid Date objects
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
    
    const isValid = fromDate <= toDate;
    
    if (!isValid) {
      const fromFormatted = formatDate(fromDate);
      const toFormatted = formatDate(toDate);
      setDateError(`Invalid date range: ${fromFormatted} is greater than ${toFormatted}`);
    } else {
      setDateError("");
    }
    return isValid;
  };

  const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const rangeParams = {
          ...(from ? { from: formatDateForApi(from) } : {}),
          ...(to ? { to: formatDateForApi(to) } : {}),
        };
        const spanParam = !from && !to ? String(compareDays) : undefined;
        const base = {
          ...rangeParams,
          ...(spanParam ? { span: spanParam } : {}),
        } as {
          from?: string;
          to?: string;
          span?: string;
        };
        const compareParams = {
          ...rangeParams,
          ...(spanParam ? { days: spanParam } : {}),
        } as {
          from?: string;
          to?: string;
          days?: string;
        };
        const [histRes, foreRes, funnelRes, catRes, heatRes, cmpRes] = await Promise.all([
          backend.get<DailySalesResponse>("/api/v1/analytics/sales/daily", { params: base }),
          backend.get<ForecastResponse>("/api/v1/analytics/sales/forecast", {
            params: { horizon: 7, window: 7 },
          }),
          backend.get<FunnelResponse>("/api/v1/analytics/bookings/funnel", { params: base }),
          backend.get<CategoryPerfResponse>("/api/v1/analytics/bookings/category-performance", { params: base }),
          backend.get<HeatmapResponse>("/api/v1/analytics/bookings/heatmap", { params: base }),
          backend.get<CompareResponse>("/api/v1/analytics/bookings/compare", { params: compareParams }),
        ]);
        if (histRes.data.success) setDaily(histRes.data.data || []);
        else setError("Failed to fetch daily sales");
        if (foreRes.data.success) setForecast(foreRes.data.forecast || []);
        else setError((e) => e || "Failed to fetch forecast");
        if (funnelRes.data.success) setFunnel(funnelRes.data.data);
        if (catRes.data.success) setCatPerf(catRes.data.data || []);
        if (heatRes.data.success) setHeatmap(heatRes.data.data || []);
        if (cmpRes.data.success) setCompare(cmpRes.data);
      } catch (e) {
        console.error("Failed to load analytics", e);
        let message = "Unable to load analytics. Please try again later.";
        if (axios.isAxiosError(e)) {
          const apiMessage =
            (typeof e.response?.data === "object" && e.response?.data && "message" in e.response.data
              ? (e.response.data as { message?: string }).message
              : undefined) ||
            e.response?.statusText ||
            e.message;
          if (apiMessage) message = apiMessage;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, compareDays]);

  const chartConfig = {
    bookings: { label: "Bookings", color: "hsl(221, 83%, 53%)" },
    guests: { label: "Guests", color: "hsl(24, 95%, 53%)" }
  } as const;
 
  const hasData = daily.length > 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
            {from && to
              ? `from ${formatDate(from)} to ${formatDate(to)}`
              : from || to
              ? `${from ? `from ${formatDate(from)}` : ""}${from && to ? " to " : ""}${to ? `to ${formatDate(to)}` : ""}`
              : `last ${compareDays} days`}
          </div>
        </div>
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(date) => {
                    setFrom(date);
                    setDateError("");
                    if (date && to && date > to) {
                      setDateError("From date cannot be after To date");
                    } else {
                      setDateError("");
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={to}
                  onSelect={(date) => {
                    setTo(date);
                    setDateError("");
                    if (date && from && date < from) {
                      setDateError("To date cannot be before From date");
                    } else {
                      setDateError("");
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Compare</label>
            <div className="flex border rounded overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${!from && !to && compareDays === 7 ? 'bg-primary text-white' : ''}`}
                onClick={() => {
                  setCompareDays(7);
                  setFrom(undefined);
                  setTo(undefined);
                  setDateError("");
                }}
              >
                7d
              </button>
              <button
                className={`px-3 py-1 text-sm ${!from && !to && compareDays === 30 ? 'bg-primary text-white' : ''}`}
                onClick={() => {
                  setCompareDays(30);
                  setFrom(undefined);
                  setTo(undefined);
                  setDateError("");
                }}
              >
                30d
              </button>
            </div>
          </div>
          <button onClick={loadData} className="px-3 py-2 text-sm border rounded">Refresh</button>
        </div>
        {dateError && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {dateError}
          </div>
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading analytics...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <>
            {/* Compare KPI Cards */}
            {compare && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="pb-2"><CardTitle>Bookings</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <div className="text-2xl font-semibold">{compare.current.bookings}</div>
                    <div className="text-muted-foreground">Prev: {compare.previous.bookings} · Growth {compare.growth.bookings}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle>Guests</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <div className="text-2xl font-semibold">{compare.current.guests}</div>
                    <div className="text-muted-foreground">
                      Prev: {compare.previous.guests} · Growth {compare.growth.guests}% · Diff {compare.diff.guests}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Daily Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer>
                      <LineChart data={daily} margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, angle: -45, textAnchor: 'end', height: 60 } as React.SVGProps<SVGTextElement>}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            // Format as DD/MM
                            return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                          }}
                          interval={Math.max(1, Math.floor(daily.length / 7))} // Show approximately 7 labels
                          height={60}
                          padding={{ left: 10, right: 10 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="guests" stroke="var(--color-guests)" strokeWidth={2} dot={false} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No executed bookings yet.</p>
                )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                {forecast.length ? (
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer>
                      <BarChart data={forecast} margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="guests" fill="var(--color-guests)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No forecast available.</p>
                )}
              </CardContent>
            </Card>

            {/* Funnel */}
            {funnel && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {([
                      ["Pending", funnel.counts.pending],
                      ["Accepted", funnel.counts.accepted],
                      ["Payment Pending", funnel.counts.paymentPending],
                      ["Confirmed", funnel.counts.confirmed],
                      ["Executed", funnel.counts.executed],
                      ["Rejected", funnel.counts.rejected],
                    ] as const).map(([label, value]) => (
                      <div key={label} className="p-3 rounded border">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-xl font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                                  </CardContent>
              </Card>
            )}

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {catPerf.length ? (
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer>
                      <BarChart data={catPerf} margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="guests" fill="var(--color-guests)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data.</p>
                )}
                <div className="mt-3">
                  <a
                    className="text-sm text-primary underline"
                    href={`${env.PUBLIC_BACKEND_URL}/api/v1/analytics/export/category-performance.csv?${new URLSearchParams({
                      ...(from ? { from: formatDateForApi(from) } : {}),
                      ...(to ? { to: formatDateForApi(to) } : {}),
                      ...(!from && !to ? { span: String(compareDays) } : {}),
                    }).toString()}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download Category CSV
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Heatmap</CardTitle>
                <p className="text-sm text-muted-foreground">Number of bookings by day and hour</p>
              </CardHeader>
              <CardContent>
                {heatmap.length ? (
                  <div className="overflow-x-auto p-2">
                    <div className="grid grid-cols-[80px_repeat(24,minmax(28px,1fr))] gap-0.5">
                      {/* Header row with hours (0-23) */}
                      <div className="h-8 flex items-end pb-1" />
                      {Array.from({ length: 24 }).map((_, h) => (
                        <div 
                          key={h} 
                          className="text-[10px] font-medium text-center text-muted-foreground h-8 flex flex-col items-center justify-end pb-1 border-b border-border"
                        >
                          <span>{h}</span>
                          <span className="text-[9px] opacity-70">h</span>
                        </div>
                      ))}

                      {/* Rows for each day */}
                      {Array.from({ length: 7 }).map((_, w) => {
                        const weekday = ((w + 1) % 7) + 1; // 1..7, start Mon visually
                        const label = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][weekday-1];
                        const row = heatmap.filter(c => c.weekday === weekday);
                        const max = Math.max(1, ...row.map(c => c.count));
                        const get = (hour: number) => row.find(c => c.hour === hour)?.count || 0;
                        
                        return (
                          <React.Fragment key={`row-${weekday}`}>
                            <div className="text-sm font-medium text-right pr-2 py-1.5 border-r border-border flex items-center justify-end bg-muted/20">
                              {label}
                            </div>
                            {Array.from({ length: 24 }).map((_, h) => {
                              const v = get(h);
                              const intensity = v === 0 ? 0 : 0.2 + (Math.min(1, v / max) * 0.8);
                              const bg = v === 0 
                                ? 'bg-muted/20' 
                                : `hsl(160, 84%, ${100 - (intensity * 60)}%)`;
                              
                              return (
                                <div 
                                  key={`cell-${weekday}-${h}`}
                                  title={`${label} ${h}:00 - ${h+1}:00 | ${v} booking${v !== 1 ? 's' : ''}`}
                                  className={`
                                    h-8 border border-background rounded-sm
                                    hover:ring-2 hover:ring-foreground hover:z-10
                                    transition-all duration-150 ease-in-out
                                    flex items-center justify-center text-xs font-medium
                                    ${v > 0 ? 'text-white' : 'text-muted-foreground/50'}
                                    relative group
                                  `}
                                  style={{ 
                                    backgroundColor: bg,
                                    minWidth: '28px',
                                    boxShadow: v > 0 ? `inset 0 0 0 1px rgba(0,0,0,0.05)` : 'none'
                                  }}
                                >
                                  {v > 0 && (
                                    <>
                                      <span className="text-xs font-medium">
                                        {v}
                                      </span>
                                      <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}