import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '@/config/env';

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    role: 'customer' | 'owner';
}

export interface UserBooking {
    bookingID: string;
    userID: string;
    restaurantID: string;
    bookingAt: string;
    numberOfGuests: number;
    message: string;
    status: string;
    category: string;
    phoneNumber: string;
    fullName: string;
    email: string;
}

interface IUserData {
    user: IUser | null;
    setUser: (user: IUser | null) => void;

    token: string | null;
    setToken: (token: string | null) => void;

    verifying: boolean;
    setVerifying: (current: boolean) => void;

    isAuthenticated: () => boolean;

    makeLogin: (user: IUser, token: string) => void;
    makeLogout: () => void;

    bookings: UserBooking[];
    setBookings: (bookings: UserBooking[]) => void;
    addBooking: (booking: UserBooking) => void;
    clearBookings: () => void;

    reset: () => void;
}

export const useUserData = create<IUserData>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user: IUser | null) => set({ user }),

            token: null,
            setToken: (token: string | null) => set({ token }),

            verifying: false,
            setVerifying: (current: boolean) => set({ verifying: current }),

            isAuthenticated: () => !!get().token,

            makeLogin: (user: IUser, token: string) => set({ user, token }),
            makeLogout: () =>
                set({
                    user: null,
                    token: null,
                    bookings: [],
                }),

            bookings: [],
            setBookings: (bookings) => set({ bookings }),
            addBooking: (booking) =>
                set((state) => ({
                    bookings: [booking, ...state.bookings],
                })),
            clearBookings: () => set({ bookings: [] }),

            reset: () =>
                set({
                    user: null,
                    token: null,
                    verifying: false,
                    bookings: [],
                }),
        }),
        {
            name: `user-storage@${config.PUBLIC_NODE_ENV}`,
        },
    ),
);
