"use client";

import { Toast } from "@/components/Toast";
import { backend } from "@/config/backend";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { CheckCircle, XCircle, Loader2, AlertCircle, Home, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [valid, setValid] = React.useState<boolean | null>(null);
    const [bookingId, setBookingId] = React.useState<string | null>(null);

    const router = useRouter();

    const searchParams = useSearchParams();
    const razorpay_payment_id = searchParams.get("razorpay_payment_id");
    const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
    const razorpay_payment_link_reference_id = searchParams.get("razorpay_payment_link_reference_id");
    const razorpay_payment_link_status = searchParams.get("razorpay_payment_link_status");
    const razorpay_signature = searchParams.get("razorpay_signature");

    React.useEffect(() => {
        const fetcher = async () => {
            // Validate required parameters
            if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_signature) {
                setError("Missing required payment parameters");
                setValid(false);
                setLoading(false);
                Toast.error("Invalid payment callback");
                router.replace("/");
                return;
            }

            try {
                setLoading(true);

                const { data } = await backend.post("/api/v1/booking/payment-callback", {
                    razorpay_payment_id,
                    razorpay_payment_link_id,
                    razorpay_payment_link_reference_id,
                    razorpay_payment_link_status,
                    razorpay_signature,
                });

                if (!data?.success) {
                    setValid(false);
                    setError("Payment verification failed");
                    Toast.error("Payment verification failed");
                    return;
                }

                if (data.bookingDone) {
                    setValid(true);
                    setBookingId(data.bookingId || null);
                    Toast.success("Booking completed successfully");
                } else {
                    setValid(false);
                    setError("Payment not completed, booking rejected");
                    Toast.error("Payment not completed, booking rejected");
                }
            } catch (error: unknown) {
                const err = error as AxiosError<{ message: string }>;

                if (err.response?.data?.message) {
                    setError(err.response?.data?.message);
                    Toast.error(err.response?.data?.message);
                } else {
                    setError("Something went wrong");
                    Toast.error("Something went wrong");
                }
                setValid(false);
            } finally {
                setLoading(false);
            }
        };

        fetcher();
    }, [router, razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature]);

    const handleGoHome = () => {
        router.replace("/")
    };

    const handleViewBookings = () => {
        router.replace("/bookings");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <Card>
                    <CardContent className="p-8 md:p-12">
                        {loading && (
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Verifying Payment
                                </h2>
                                <p className="text-muted-foreground">
                                    Please wait while we confirm your payment...
                                </p>
                            </div>
                        )}

                        {!loading && valid && (
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <CheckCircle className="w-20 h-20 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">
                                    Payment Successful!
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    Your booking has been confirmed successfully.
                                </p>

                                {bookingId && (
                                    <Alert className="mb-6">
                                        <AlertDescription>
                                            <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
                                            <p className="text-lg font-mono font-semibold">
                                                {bookingId}
                                            </p>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Card className="mb-6">
                                    <CardContent className="p-6 text-left">
                                        <h3 className="text-sm font-semibold mb-3">
                                            Payment Details
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between pb-2">
                                                <span className="text-muted-foreground">Payment ID:</span>
                                                <span className="font-mono text-xs break-all ml-2">
                                                    {razorpay_payment_id}
                                                </span>
                                            </div>
                                            <Separator />
                                            {razorpay_payment_link_reference_id && (
                                                <>
                                                    <div className="flex justify-between pb-2">
                                                        <span className="text-muted-foreground">Reference ID:</span>
                                                        <span className="font-mono text-xs">
                                                            {razorpay_payment_link_reference_id}
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                </>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <span className="font-semibold text-green-600 capitalize">
                                                    {razorpay_payment_link_status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleViewBookings}
                                        className="flex-1"
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        View Bookings
                                    </Button>
                                    <Button
                                        onClick={handleGoHome}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Home className="w-5 h-5 mr-2" />
                                        Go to Home
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!loading && !valid && (
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    <XCircle className="w-20 h-20 text-destructive" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">
                                    Payment Failed
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {error || "Unable to verify your payment. Please try again."}
                                </p>

                                <Alert variant="destructive" className="mb-6">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="text-left">
                                            <p className="font-semibold mb-1">
                                                What happened?
                                            </p>
                                            <p className="text-sm">
                                                Your payment could not be verified. If money was deducted from your account, it will be refunded within 5-7 business days.
                                            </p>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {razorpay_payment_id && (
                                    <Card className="mb-6">
                                        <CardContent className="p-6 text-left">
                                            <h3 className="text-sm font-semibold mb-3">
                                                Transaction Details
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Payment ID:</span>
                                                    <span className="font-mono text-xs break-all ml-2">
                                                        {razorpay_payment_id}
                                                    </span>
                                                </div>
                                                {razorpay_payment_link_status && (
                                                    <>
                                                        <Separator />
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Status:</span>
                                                            <span className="font-semibold text-destructive capitalize">
                                                                {razorpay_payment_link_status}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleGoHome}
                                        className="flex-1"
                                    >
                                        <Home className="w-5 h-5 mr-2" />
                                        Go to Home
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}