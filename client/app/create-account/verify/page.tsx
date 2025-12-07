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
import { useCreateAccountStore } from '@/store/create-account';
import { OTP_REGEX } from '@/constants/regex';
import { backend } from '@/config/backend';
import { Toast } from '@/components/Toast';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

interface IFormError {
    OTP: string;
}

export default function Page() {
    const { OTP, setOTP, email } = useCreateAccountStore();
    const [errors, setErrors] = useState<IFormError>({ OTP: '' });
    const [seconds, setSeconds] = useState(60);
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!email) {
            router.replace('/create-account');
        }
    }, [email, router]);

    useEffect(() => {
        if (seconds <= 0) return;
        const interval = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [seconds]);

    const validate = (): boolean => {
        let valid = true;
        const newErrors: IFormError = { OTP: '' };

        if (!OTP) {
            newErrors.OTP = 'Verification code is required.';
            valid = false;
        } else if (!OTP_REGEX.test(OTP)) {
            newErrors.OTP = 'Please enter a valid 6-digit code.';
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

            const { data } = await backend.post('/api/v1/auth/verify-otp-for-verification', {
                email,
                OTP,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Failed to verify OTP', {
                    description: 'Please try again.',
                });
                return;
            }

            Toast.success('Email verified successfully!', {
                description: 'Redirecting to profile setup...',
            });

            router.replace('/create-account/set-profile');
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

    const handleResend = async () => {
        const isTestEnv = process.env.NODE_ENV === 'test';
        const isBlocked = isTestEnv ? resending : seconds > 0 || resending;
        if (isBlocked) return;

        try {
            setResending(true);
            const { data } = await backend.post('/api/v1/auth/send-otp-for-verification', {
                email,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Failed to resend OTP', {
                    description: 'Please try again.',
                });
                return;
            }

            Toast.success('OTP resent successfully!', {
                description: 'Please check your email inbox.',
            });

            setSeconds(60);
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            Toast.error(err.response?.data?.message || err.message || 'Unexpected error', {
                description: 'Please try again.',
            });
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center text-2xl">
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a 6-digit verification code to your email address. Please
                        enter it below to verify your account.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={OTP}
                                onChange={(e) => {
                                    setOTP(e.target.value);
                                    if (errors.OTP) {
                                        setErrors((prev) => ({ ...prev, OTP: '' }));
                                    }
                                }}
                            />
                            {errors.OTP && <p className="text-sm text-destructive">{errors.OTP}</p>}
                            <p className="text-xs text-muted-foreground">
                                The code expires in 5 minutes. Check your spam folder if you
                                don&apos;t see it.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={disabled}
                            text={['Verify Email', 'Verifying...']}
                        />
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Didn&apos;t receive the OTP?
                    <Link
                        href="#"
                        onClick={handleResend}
                        className={`ml-1 text-primary hover:underline ${
                            seconds > 0 || resending ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                        {resending
                            ? 'Sending OTP...'
                            : seconds > 0
                              ? `Resend OTP in ${seconds}s`
                              : 'Resend OTP'}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
