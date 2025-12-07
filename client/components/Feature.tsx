'use client';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';
import Image from 'next/image';

const content = [
    {
        title: 'Smart Table Reservations',
        description:
            'Allow customers to reserve tables instantly from any device. Our platform provides a seamless booking experience — select date, time, and party size in seconds. No more waiting calls or confusion.',
        content: (
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl">
                <Image
                    src="/SmartTableReservation.jpeg"
                    alt="Customer making a restaurant reservation"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        ),
    },
    {
        title: 'Real-Time Availability',
        description:
            'Our system updates table availability in real time, ensuring that double bookings are avoided. Customers and restaurant staff always see the latest status, keeping operations smooth and accurate.',
        content: (
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl">
                <Image
                    src="/RealTimeAvailability.avif"
                    alt="Restaurant table availability dashboard"
                    fill
                    className="object-cover"
                />
            </div>
        ),
    },
    {
        title: 'Restaurant Dashboard',
        description:
            'Empower restaurants with an easy-to-use dashboard to manage reservations, track customer preferences, and plan seating layouts. The dashboard integrates all booking data into a single, intuitive view.',
        content: (
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl">
                <Image
                    src="/RestaurantDashboard.avif"
                    alt="Restaurant staff using dashboard"
                    fill
                    className="object-cover"
                />
            </div>
        ),
    },
    {
        title: 'Customer Experience Insights',
        description:
            'Track trends, peak hours, and feedback through analytics. Restaurants can improve service quality and make data-driven decisions for better customer satisfaction and optimized operations.',
        content: (
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-2xl">
                <Image
                    src="/CustomerExperienceInsights.avif"
                    alt="Restaurant analytics dashboard with insights"
                    fill
                    className="object-cover"
                />
            </div>
        ),
    },
];

export function Feature() {
    return (
        <div className="w-full pt-4">
            <div className="mb-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Features</h2>
                <p className="text-muted-foreground">
                    Explore the powerful features that make our product stand out.
                </p>
            </div>
            <StickyScroll content={content} />
        </div>
    );
}
