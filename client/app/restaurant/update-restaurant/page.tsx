'use client';
import  MultiStepRestaurantFormEdit  from '@/components/set-restaurant-update-form';
import { Card } from '@/components/ui/card';
import { useRestaurantData } from '@/store/restaurant';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditRestaurantPage() {
    const { restaurant } = useRestaurantData();
    const router = useRouter();
    useEffect(() => {
        if (!restaurant) {
            router.replace('/restaurant/dashboard');
        }
    });

    if (!restaurant) {
        return null;
    }
    return (
        <main className="min-h-screen bg-background py-8 sm:py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                        Update Restaurant Details
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground">
                        Manage and update your restaurant profile information
                    </p>
                </div>

                <Card className="p-6 sm:p-8 border border-border shadow-lg">
                    <MultiStepRestaurantFormEdit />
                </Card>

                {/* Info Note */}
                <Card className="mt-6 sm:mt-8 p-4 sm:p-5 border border-border shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Note:</span> All fields
                        marked with an asterisk <span className="text-destructive">*</span> are
                        required. Changes will be saved and reflected across your restaurant
                        profile.
                    </p>
                </Card>
            </div>
        </main>
    );
}
