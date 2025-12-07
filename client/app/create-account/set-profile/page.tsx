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
import { NAME_REGEX, PASSWORD_REGEX, ROLE_REGEX } from '@/constants/regex';
import { Toast } from '@/components/Toast';
import { backend } from '@/config/backend';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

interface IFormError {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    role: string;
    cityName: string
}

export default function Page() {
    const {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        role,
        setRole,
        email,
        OTP,
        cityName,
        setCityName
    } = useCreateAccountStore();

    const [errors, setErrors] = useState<IFormError>({
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: '',
        cityName: "",
    });

    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!email || !OTP) {
            router.replace('/create-account');
        }
    }, [email, router, OTP]);

    const validate = (): boolean => {
        let valid = true;

        const newErrors: IFormError = {
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
            role: '',
            cityName: "",
        };

        if (!NAME_REGEX.test(firstName)) {
            newErrors.firstName =
                'First name must be at least 2 characters and contain only letters.';
            valid = false;
        }

        if (!NAME_REGEX.test(lastName)) {
            newErrors.lastName =
                'Last name must be at least 2 characters and contain only letters.';
            valid = false;
        }

        if (!PASSWORD_REGEX.test(password)) {
            newErrors.password =
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
            valid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            valid = false;
        }

        if (!ROLE_REGEX.test(role ?? '')) {
            newErrors.role = 'Please select a valid role.';
            valid = false;
        }

        if (cityName.length === 0) {
            newErrors.cityName = "Please enter you city name"
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

            const { data } = await backend.post('/api/v1/auth/create-account', {
                email,
                firstName,
                lastName,
                password,
                role,
                cityName,
            });

            if (!data?.success) {
                Toast.error(data?.message || 'Failed to save profile', {
                    description: 'Please try again.',
                });
                return;
            }

            Toast.success('Profile created successfully!', {
                description: 'Redirecting to dashboard...',
            });

            router.replace('/create-account/success');
            return;
        } catch (error: unknown) {
            const err = error as AxiosError<{ message: string }>;
            Toast.error(err.message || err.response?.data?.message || 'An unexpected error occurred.', {
                description: 'Please try again.',
            });
        } finally { 
            setDisabled(false);
            setLoading(false);
        }
    };

    if (!email || !OTP) return null;

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center text-2xl">
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>
                        Just a few more details to get you started. This helps us personalize your
                        experience.
                    </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Enter your first name"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    setErrors({ ...errors, firstName: '' });
                                }}
                            />
                            {errors.firstName && (
                                <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Enter your last name"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    setErrors({ ...errors, lastName: '' });
                                }}
                            />
                            {errors.lastName && (
                                <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
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
                            <p
                                className={`text-xs ${errors.password ? 'text-destructive' : 'text-muted-foreground'}`}
                            >
                                Password must be at least 8 characters long and include uppercase,
                                lowercase, number, and special character.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors({ ...errors, confirmPassword: '' });
                                }}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cityName">City Name</Label>
                            <Input
                                id="cityName"
                                type="text"
                                placeholder="Enter your city name"
                                value={cityName}
                                onChange={(e) => {
                                    setCityName(e.target.value);
                                    setErrors({ ...errors, cityName: '' });
                                }}
                            />
                            {errors.cityName && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.cityName}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Choose Your Role</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Select how you&apos;ll be using this platform
                            </p>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="customer"
                                        name="role"
                                        value="customer"
                                        checked={role === 'customer'}
                                        onChange={() => {
                                            setRole('customer');
                                            setErrors({ ...errors, role: '' });
                                        }}
                                    />
                                    <span>Customer</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        id="owner"
                                        name="role"
                                        value="owner"
                                        checked={role === 'owner'}
                                        onChange={() => {
                                            setRole('owner');
                                            setErrors({ ...errors, role: '' });
                                        }}
                                    />
                                    <span>Restaurant Owner</span>
                                </label>
                            </div>
                            {errors.role && (
                                <p className="text-xs text-destructive mt-1">{errors.role}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={disabled}
                            text={['Save Profile', 'Saving...']}
                        />
                    </form>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="ml-1 text-primary hover:underline">
                        Log in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
