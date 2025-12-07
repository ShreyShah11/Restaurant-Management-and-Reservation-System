'use client';
import { MultiStepRestaurantForm } from '@/components/set-restaurant-form';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useRestaurantData } from '@/store/restaurant';
import { useEffect } from 'react';
import { useUserData } from '@/store/user';
import { LoadingPage } from '@/components/Loading';
interface Address {
    line1: string;
    line2: string;
    line3: string;
    zip: string;
    city: string;
    state: string;
    country: string;
}

interface OpeningHoursDay {
    start: string;
    end: string;
}

interface OpeningHours {
    weekday: OpeningHoursDay;
    weekend: OpeningHoursDay;
}

interface Status {
    isActive: boolean;
    isVerified: boolean;
    temporarilyClosed: boolean;
}

interface Restaurant {
    _id: string;
    owner: string;
    ownerName: string;
    restaurantName: string;
    restaurantEmail: string;
    phoneNumber: string;
    about: string;
    slogan: string;
    since: number;
    bannerURL: string;
    logoURL: string;
    address: Address;
    openingHours: OpeningHours;
    status: Status;
    ratingsSum: number;
    ratingsCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
export default function AddRestaurantPage() {
    const router = useRouter();
    const { restaurant } = useRestaurantData();
    console.log('restaurant ', restaurant);
    useEffect(() => {
        if (restaurant) {
            router.replace('/restaurant/dashboard');
        }
    });

    if (restaurant) {
        return <LoadingPage />;
    }
    return (
        <main className="min-h-screen bg-background py-8 sm:py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="p-6 sm:p-8 border border-border shadow-lg">
                    <MultiStepRestaurantForm />
                </Card>

                {/* Info Note */}
                <Card className="mt-6 sm:mt-8 p-4 sm:p-5 border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Pro Tip:</span> All fields
                        marked with an asterisk <span className="text-destructive">*</span> are
                        required. Your restaurant information will be saved securely and verified by
                        our team.
                    </p>
                </Card>
            </div>
        </main>
    );
}
