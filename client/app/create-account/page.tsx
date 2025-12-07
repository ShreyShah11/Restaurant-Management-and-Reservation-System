'use client';

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useCreateAccountStore } from '@/store/create-account';
import React, { useEffect, useState } from 'react';
import { EMAIL_REGEX } from '@/constants/regex';
import { AxiosError } from 'axios';
import { Toast } from '@/components/Toast';
import { backend } from '@/config/backend';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/store/user';

interface IFormError {
    email: string;
}

export default function Page() {
    const { email, setEmail } = useCreateAccountStore();
    const { isAuthenticated } = useUserData();
    const [errors, setErrors] = useState<IFormError>({ email: '' });

    const router = useRouter();
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        let valid = true;
        const newErrors: IFormError = { email: '' };

        if (!email) {
            newErrors.email = 'Email address is required';
            valid = false;
        } else if (!EMAIL_REGEX.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const valid = validate();
        if (!valid) return;

        try {
            setDisabled(true);
            setLoading(true);

            const { data } = await backend.post('/api/v1/auth/send-otp-for-verification', {
                email,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Failed to send OTP', {
                    description: 'Please try again.',
                });
                return;
            }

            Toast.success('OTP sent successfully to your email!', {
                description: 'Please check your inbox.',
            });

            router.replace('/create-account/verify');
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            Toast.error(err.response?.data?.message || err.message || 'Unexpected error', {
                description: 'Please try again.',
            });
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated()) {
            router.replace('/');
            Toast.info('You are already logged in.', {
                description: 'Redirecting to home page.',
            });
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center text-2xl">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                        Join us today and start your journey. Enter your email address to get
                        started.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) {
                                        setErrors({ ...errors, email: '' });
                                    }
                                }}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                We&apos;ll send a verification code to this email address.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={disabled}
                            text={['Send Verification Code', 'Sending...']}
                        />
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
                        Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
