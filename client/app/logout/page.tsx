'use client';

import { LoadingPage } from '@/components/Loading';
import { Toast } from '@/components/Toast';
import { backend } from '@/config/backend';
import { useCreateAccountStore } from '@/store/create-account';
import { useLoginStore } from '@/store/login';
import { useResetPasswordStore } from '@/store/reset-password';
import { useRestaurantData } from '@/store/restaurant';
import { useUserData } from '@/store/user';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Page() {
    const router = useRouter();

    React.useEffect(() => {
        const fetcher = async () => {
            try {
                const { data } = await backend.post('/api/v1/auth/logout');

                if (!data?.success) {
                    Toast.error(data?.message || 'Logout failed. Please try again.', {
                        description: 'There was a problem logging you out.',
                    });
                    return;
                }

                Toast.success('You have been logged out successfully.');
            } catch (error: unknown) {
                console.error('Error in Logout: ', error);

                const err = error as AxiosError<{ message: string }>;

                if (err.response?.data.message) {
                    Toast.error(err.response.data.message, {
                        description: 'Please try again later.',
                    });
                    return;
                }

                if (err.message) {
                    Toast.error(err.message, {
                        description: 'An unexpected error occurred.',
                    });
                    return;
                }

                Toast.error('An unknown error occurred during logout.', {
                    description: 'Please refresh the page or try again.',
                });
            } finally {
                useCreateAccountStore.getState().reset();
                useResetPasswordStore.getState().reset();
                useLoginStore.getState().reset();
                useUserData.getState().reset();
                useRestaurantData.getState().reset();
                router.replace('/');
            }
        };

        fetcher();
    }, [router]);

    return <LoadingPage />;
}
