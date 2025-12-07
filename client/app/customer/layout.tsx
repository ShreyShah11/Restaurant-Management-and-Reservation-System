'use client';
import { LoadingPage } from '@/components/Loading';
import { useUserData } from '@/store/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useUserData();
    const router = useRouter();
    useEffect(() => {
        if (!user || user.role !== 'customer') {
            router.replace('/login');
        }
    }, [router, user]);

    if (!user) {
        return <LoadingPage />;
    }

    return <>{children}</>;
}
