'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useResetPasswordStore } from '@/store/reset-password';

export default function SuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    const { email, OTP, confirmPassword, reset } = useResetPasswordStore();

    useEffect(() => {
        if (countdown === 0) {
            reset();
            router.push('/login');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, router]);

    useEffect(() => {
        if (!email || !OTP || !confirmPassword) {
            router.push('/reset-password');
        }
    });

    if (!email || !OTP || !confirmPassword) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center text-green-600 mb-4">
                        <CheckCircle className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
                    <CardDescription>
                        Great! Your password has been successfully reset. You can now sign in with
                        your new password.
                        <br />
                        You will be redirected to the login page in{' '}
                        <span className="font-semibold">{countdown} seconds</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <Progress value={(5 - countdown) * 20} className="w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
