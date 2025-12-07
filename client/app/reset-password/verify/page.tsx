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
import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { Toast } from '@/components/Toast';
import { backend } from '@/config/backend';
import { useResetPasswordStore } from '@/store/reset-password';
import { useRouter } from 'next/navigation';

interface IFormError {
    OTP: string;
}

export default function Page() {
    const { OTP, setOTP, email } = useResetPasswordStore();
    const [errors, setErrors] = React.useState<IFormError>({
        OTP: '',
    });
    const [seconds, setSeconds] = React.useState(60);

    const router = useRouter();
    const [disable, setDisable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (seconds <= 0) return;
        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [seconds]);

    const validate = (): boolean => {
        let valid = true;
        const newErrors: IFormError = {
            OTP: '',
        };

        if (!OTP) {
            newErrors.OTP = 'Verification code is required';
            valid = false;
        } else if (!/^\d{6}$/.test(OTP)) {
            newErrors.OTP = 'Enter a valid 6-digit code';
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
            setDisable(true);
            setLoading(true);

            const { data } = await backend.post('/api/v1/auth/reset-password/verify-otp', {
                email,
                OTP,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'OTP verification failed.', {
                    description: 'Please try again or request a new code.',
                });
                return;
            }

            Toast.success('OTP verified successfully. You can now reset your password.', {
                description: 'Proceed to the next step.',
            });

            router.replace('/reset-password/set-password');
        } catch (error) {
            console.error('OTP verification failed:', error);
            const err = error as AxiosError<{ message: string }>;

            if (err.response?.data.message) {
                Toast.error(err.response?.data.message, {
                    description: 'Please try again or request a new code.',
                });

                return;
            }

            if (err.message) {
                Toast.error(err.message, {
                    description: 'Please try again or request a new code.',
                });
                return;
            }

            Toast.error('An unexpected error occurred. Please try again later.', {
                description: 'Please try again or request a new code.',
            });
        } finally {
            setDisable(false);
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (seconds === 0) {
            try {
                setResendLoading(true);

                const { data } = await backend.post('/api/v1/auth/reset-password/send-otp', {
                    email: email,
                });

                if (!data?.success) {
                    Toast.error(data?.message || 'Resend OTP failed.', {
                        description: 'Please try again or request a new code.',
                    });
                    return;
                }

                Toast.success('A new OTP has been sent to your email.', {
                    description: 'Please check your inbox.',
                });
            } catch (error: unknown) {
                console.error('Resend OTP failed:', error);
                Toast.error('Failed to resend OTP. Please try again later.', {
                    description: 'Please try again or request a new code.',
                });
                return;
            } finally {
                setSeconds(60);
                setResendLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!email) {
            router.replace('/reset-password');
        }
    });

    if (!email) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center text-2xl">
                    <CardTitle>Verify Your Identity</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a 6-digit verification code to your email. Enter it below to
                        proceed with resetting your password.
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
                                    setErrors({ ...errors, OTP: '' });
                                }}
                            />
                            {errors.OTP && <p className="text-sm text-destructive">{errors.OTP}</p>}
                            <p className="text-xs text-muted-foreground">
                                The code expires in 5 minutes. Check your spam folder if needed.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={disable}
                            loading={loading}
                            text={['Verify Code', 'Verifying...']}
                        />
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Didn&apos;t receive the OTP?
                    <button
                        type="button"
                        onClick={() => {
                            handleResend();
                        }}
                        className={`${seconds > 0 ? 'cursor-not-allowed opacity-50' : ''} ml-1 text-primary hover:underline`}
                    >
                        {seconds > 0
                            ? `Resend OTP in ${seconds}s`
                            : resendLoading
                                ? 'Resending...'
                                : 'Resend OTP'}
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
