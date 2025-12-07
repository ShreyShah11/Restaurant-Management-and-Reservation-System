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
import React, { useEffect, useState } from 'react';
import { EMAIL_REGEX } from '@/constants/regex';
import { Toast } from '@/components/Toast';
import { AxiosError } from 'axios';
import { backend } from '@/config/backend';
import { useRouter } from 'next/navigation';
import { useResetPasswordStore } from '@/store/reset-password';
import { useUserData } from '@/store/user';

interface IFormError {
    email: string;
}

export default function Page() {
    const { email, setEmail } = useResetPasswordStore();
    const { isAuthenticated } = useUserData();
    const [errors, setErrors] = useState<IFormError>({
        email: '',
    });

    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const validate = (): boolean => {
        let valid = true;
        const newErrors: IFormError = {
            email: '',
        };

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

            const { data } = await backend.post('/api/v1/auth/reset-password/send-otp', {
                email: email,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Failed to send verification code.', {
                    description: 'Please try again later.',
                });
                return;
            }

            Toast.success('Verification code sent!', {
                description: 'Please check your email for the code to reset your password.',
            });

            router.replace('/reset-password/verify');
        } catch (error: unknown) {
            console.log('Error sending verification code:', error);

            const err = error as AxiosError<{ message: string }>;

            if (err.response?.data.message) {
                Toast.error(err.response?.data.message, {
                    description: 'Please try again later.',
                });

                return;
            }

            if (err.message) {
                Toast.error(err.message, {
                    description: 'Please try again later.',
                });
                return;
            }

            Toast.error('An unexpected error occurred.', {
                description: 'Please try again later.',
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
                    <CardTitle>Forgot Your Password?</CardTitle>
                    <CardDescription>
                        No worries! Enter your email address and we&apos;ll send you a verification
                        code to reset your password.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors({ ...errors, email: '' });
                                }}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Enter the email associated with your account.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={disabled}
                            text={['Send Verification Code', 'Sending']}
                        />
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
                        Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
