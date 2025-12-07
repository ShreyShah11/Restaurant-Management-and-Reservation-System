import { create } from 'zustand';

export interface ICreateAccountStore {
    email: string;
    setEmail: (email: string) => void;

    OTP: string;
    setOTP: (OTP: string) => void;

    firstName: string;
    setFirstName: (firstName: string) => void;

    lastName: string;
    setLastName: (lastName: string) => void;

    password: string;
    setPassword: (password: string) => void;

    confirmPassword: string;
    setConfirmPassword: (confirmPassword: string) => void;

    role: 'owner' | 'customer';
    setRole: (role: 'owner' | 'customer') => void;

    cityName: string;
    setCityName: (cityName: string) => void;

    reset: () => void;
}

export const useCreateAccountStore = create<ICreateAccountStore>((set) => ({
    email: '',
    setEmail: (email) => set({ email }),

    OTP: '',
    setOTP: (OTP) => set({ OTP }),

    firstName: '',
    setFirstName: (firstName) => set({ firstName }),

    lastName: '',
    setLastName: (lastName) => set({ lastName }),

    password: '',
    setPassword: (password) => set({ password }),

    confirmPassword: '',
    setConfirmPassword: (confirmPassword) => set({ confirmPassword }),

    role: 'customer',
    setRole: (role) => set({ role }),

    cityName: '',
    setCityName: (cityName) => set({ cityName }),

    reset: () => {
        set({
            email: '',
            OTP: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
            role: 'customer',
            cityName: '',
        });
    },
}));
