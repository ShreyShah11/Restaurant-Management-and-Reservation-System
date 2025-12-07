'use client';

import { useBookingNotifications } from '@/hooks/use-booking-notifications';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface BookingAlertProps {
    restaurantId: string;
}

export default function BookingAlert({ restaurantId }: BookingAlertProps) {
    const { newBooking, isConnected, clearNotification } = useBookingNotifications(restaurantId);

    useEffect(() => {
        if (newBooking) {

            toast.success(newBooking.message, {
                description: `New booking received`,
                duration: 5000,
            });

            clearNotification();
        }
    }, [newBooking, clearNotification]);

    return (
        <div className="fixed bottom-4 right-4">
            {isConnected ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium">Real-time alerts active</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span className="text-sm font-medium">Connecting...</span>
                </div>
            )}
        </div>
    );
}
