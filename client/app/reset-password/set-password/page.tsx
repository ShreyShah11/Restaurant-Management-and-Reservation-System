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
import { PASSWORD_REGEX } from '@/constants/regex';
import { AxiosError } from 'axios';
import { Toast } from '@/components/Toast';
import { backend } from '@/config/backend';
import { useResetPasswordStore } from '@/store/reset-password';
import { useRouter } from 'next/navigation';

interface IFormError {
    password: string;
    confirmPassword: string;
}

export default function Page() {
    const { OTP, email, password, confirmPassword, setConfirmPassword, setPassword } =
        useResetPasswordStore();
    const router = useRouter();
    const [errors, setErrors] = useState<IFormError>({
        password: '',
        confirmPassword: '',
    });

    const validate = (): boolean => {
        let valid = true;
        const newErrors: IFormError = {
            password: '',
            confirmPassword: '',
        };

        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (!PASSWORD_REGEX.test(password)) {
            newErrors.password =
                'Password must be at least 8 characters, include upper and lowercase letters, a number, and a special character';
            valid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            valid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const { data } = await backend.post('/api/v1/auth/reset-password/change-password', {
                email: email,
                newPassword: password,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Denied', {
                    description: 'Please try again or contact support if the issue persists.',
                });
                return;
            }

            Toast.success('Password reset successfully', {
                description: 'You can now log in with your new password.',
            });

            router.replace('/reset-password/success');
        } catch (error: unknown) {
            console.error('Error resetting password:', error);
            const err = error as AxiosError<{ message: string }>;

            if (err.response?.data.message) {
                Toast.error(err.response?.data.message || 'Reset failed', {
                    description: 'Please try again or contact support if the issue persists.',
                });
                return;
            }

            if (err.message) {
                Toast.error('Reset failed', {
                    description: err.message,
                });
                return;
            }

            Toast.error('An unexpected error occurred', {
                description: 'Please try again later.',
            });
        }
    };

    useEffect(() => {
        if (!email || !OTP) {
            router.replace('/reset-password/');
        }
    });

    if (!email || !OTP) {
        return null;
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center text-2xl">
                    <CardTitle>Create New Password</CardTitle>
                    <CardDescription>
                        Choose a strong password for your account. Make sure it&apos;s something
                        you&apos;ll remember.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors({ ...errors, password: '' });
                                }}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters with letters and numbers.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors({
                                        ...errors,
                                        confirmPassword: '',
                                    });
                                }}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full">
                            Reset Password
                        </Button>
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Remembered your password?{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
                        Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
