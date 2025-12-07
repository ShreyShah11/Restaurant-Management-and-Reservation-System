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
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/constants/regex';
import { AxiosError } from 'axios';
import { Toast } from '@/components/Toast';
import { useLoginStore } from '@/store/login';
import { backend } from '@/config/backend';
import { IUser, useUserData } from '@/store/user';
import { useRouter } from 'next/navigation';
import { useBrowseRestaurantStore, type Restaurant } from '@/store/restaurant-browse';

interface IFormError {
  email: string;
  password: string;
}

// ✅ Helpers (same as before)
export const parseTimeToToday = (timeStr: string): Date | null => {
  if (!timeStr) return null;
  try {
    if (timeStr.includes('T')) {
      const utcDate = new Date(timeStr);
      const today = new Date();
      today.setHours(utcDate.getHours(), utcDate.getMinutes(), 0, 0);
      return today;
    }

    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (period) {
      period = period.toUpperCase();
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
    }
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  } catch {
    return null;
  }
};

const isTimeWithinRange = (now: Date, open: Date, close: Date): boolean => {
  const toMin = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const n = toMin(now);
  const o = toMin(open);
  const c = toMin(close);
  return c > o ? n >= o && n <= c : n >= o || n <= c;
};

export const isRestaurantOpenNow = (
  openingHours: {
    weekdayOpen: string;
    weekdayClose: string;
    weekendOpen: string;
    weekendClose: string;
  },
  temporarilyClosed?: boolean,
): boolean => {
  if (temporarilyClosed) return false;
  const today = new Date();
  const day = today.getDay();
  const isWeekend = day === 0 || day === 6;
  const openStr = isWeekend ? openingHours.weekendOpen : openingHours.weekdayOpen;
  const closeStr = isWeekend ? openingHours.weekendClose : openingHours.weekdayClose;
  const open = parseTimeToToday(openStr);
  const close = parseTimeToToday(closeStr);
  if (!open || !close) return false;
  const now = new Date();
  return isTimeWithinRange(now, open, close);
};

// ✅ Page Component
export default function Page() {
  const { email, setEmail, password, setPassword, reset } = useLoginStore();
  const { makeLogin, isAuthenticated } = useUserData();
  const { setRestaurants, clearRestaurants } = useBrowseRestaurantStore();

  const [errors, setErrors] = useState<IFormError>({
    email: '',
    password: '',
  });
  const [formErrorSummary, setFormErrorSummary] = useState<string | null>(null);

  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const emailErrorText =
    errors.email ||
    (!email
      ? 'Email address is required'
      : !EMAIL_REGEX.test(email)
        ? 'Please enter a valid email address'
        : '');

  const passwordErrorText =
    errors.password ||
    (!password
      ? 'Password is required'
      : !PASSWORD_REGEX.test(password)
        ? 'Password must be at least 8 characters, include upper and lowercase letters, a number, and a special character'
        : '');

  const validate = (): boolean => {
    let valid = true;
    const newErrors: IFormError = {
      email: '',
      password: '',
    };
    const summaryMessages: string[] = [];

    if (!email) {
      newErrors.email = 'Email address is required';
      valid = false;
      summaryMessages.push(newErrors.email);
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
      summaryMessages.push(newErrors.email);
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
      summaryMessages.push(newErrors.password);
    } else if (!PASSWORD_REGEX.test(password)) {
      newErrors.password =
        'Password must be at least 8 characters, include upper and lowercase letters, a number, and a special character';
      valid = false;
      summaryMessages.push('Password must be at least 8 characters');
    }

    setErrors(newErrors);
    setFormErrorSummary(summaryMessages.length ? summaryMessages.join(' ') : null);
    return valid;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: '' }));
    setFormErrorSummary(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: '' }));
    setFormErrorSummary(null);
  };

  // ✅ Fetch and set restaurants after login
  const fetchRestaurants = async () => {
    try {
      const { data } = await backend.post('/api/v1/restaurants/get-near-by-restaurants', {
        maxDistance: 200 * 1000, // 200 km
      });

      if (data.success && data.restaurants.length > 0) {
        const mapped: Restaurant[] = data.restaurants.map((entry: any) => {
          const [backendRestaurant, city, cuisines] = entry;
          const r = backendRestaurant;

          const openNow = isRestaurantOpenNow(
            {
              weekdayOpen: r.openingHours.weekday.start,
              weekdayClose: r.openingHours.weekday.end,
              weekendOpen: r.openingHours.weekend.start,
              weekendClose: r.openingHours.weekend.end,
            },
            r.status.temporarilyClosed
          );

          return {
            _id: r._id,
            restaurantName: r.restaurantName,
            logoURL: r.logoURL || '/placeholder.svg',
            bannerURL: r.bannerURL || '/placeholder.svg',
            ratingsSum: r.ratingsSum ?? 0,
            ratingsCount: r.ratingsCount ?? 0,
            slogan: r.slogan ?? '',
            address: {
              street: `${r.address.line1 || ''}, ${r.address.line2 || ''}`.trim(),
              city: city || r.address.city || 'Unknown',
              zip: backendRestaurant.address.zip,
            },
            openingHours: {
              weekdayOpen: r.openingHours.weekday.start,
              weekdayClose: r.openingHours.weekday.end,
              weekendOpen: r.openingHours.weekend.start,
              weekendClose: r.openingHours.weekend.end,
            },
            status: openNow ? 'open' : 'closed',
            city: city || r.address.city || 'Unknown',
            cuisines: cuisines?.length ? cuisines : ['General'],
            temporarilyClosed: r.status.temporarilyClosed,
            isOpen: openNow,
          };
        });

        setRestaurants(mapped);
        Toast.success('Restaurants loaded successfully');
      } else {
        clearRestaurants();
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message || 'Failed to load restaurants.';
      Toast.error('Error', { description: msg });
      clearRestaurants();
    }
  };

  // ✅ Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = validate();
    if (!valid) return;

    try {
      setDisabled(true);
      setLoading(true);

      const { data } = await backend.post('/api/v1/auth/login', {
        email,
        password,
      });

      if (!data?.success) {
        Toast.error(data?.message || 'Login failed', {
          description: 'Please check your credentials and try again.',
        });
        return;
      }

      const user: IUser = data.data;
      const token: string = data.token;

      // ✅ Save user to store
      makeLogin(user, token);
      Toast.success('Login successful', { description: `Welcome back, ${user.firstName}!` });

      // ✅ Fetch restaurants immediately after login
      await fetchRestaurants();

      reset();
      router.replace('/');
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;

      if (err.response?.data.message) {
        Toast.error(err.response?.data.message, {
          description: 'Please try again',
        });
        return;
      }

      if (err.message) {
        Toast.error(err.message, { description: 'Please try again' });
        return;
      }

      Toast.error('An unexpected error occurred. Please try again.', {
        description: 'If the problem persists, contact support.',
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
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue managing your restaurant or browse dining options.
          </CardDescription>
        </CardHeader>

        {formErrorSummary && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="login-error-summary"
            className="mx-6 mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {formErrorSummary}
          </div>
        )}

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
                onChange={(e) => handleEmailChange(e.target.value)}
                aria-invalid={Boolean(emailErrorText)}
                aria-describedby={emailErrorText ? 'login-email-error' : undefined}
              />
              {emailErrorText && (
                <p
                  id="login-email-error"
                  data-testid="login-email-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-destructive"
                >
                  {emailErrorText}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the email associated with your account.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                aria-invalid={Boolean(passwordErrorText)}
                aria-describedby={passwordErrorText ? 'login-password-error' : 'login-password-hint'}
              />
              {passwordErrorText ? (
                <p
                  id="login-password-error"
                  data-testid="login-password-error"
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-destructive"
                >
                  {passwordErrorText}
                </p>
              ) : (
                <p id="login-password-hint" className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include upper & lower case letters, a number, and a symbol.
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={disabled}
              text={['Sign In', 'Signing In...']}
            />
          </form>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/create-account" className="ml-1 text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
