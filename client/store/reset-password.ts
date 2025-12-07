import { create } from 'zustand';

interface IResetPasswordStore {
    email: string;
    setEmail: (email: string) => void;

    OTP: string;
    setOTP: (OTP: string) => void;

    password: string;
    setPassword: (password: string) => void;

    confirmPassword: string;
    setConfirmPassword: (confirmPassword: string) => void;

    reset: () => void;
}

export const useResetPasswordStore = create<IResetPasswordStore>((set) => ({
    email: '',
    setEmail: (email) => set({ email }),

    OTP: '',
    setOTP: (OTP) => set({ OTP }),

    password: '',
    setPassword: (password) => set({ password }),

    confirmPassword: '',
    setConfirmPassword: (confirmPassword) => set({ confirmPassword }),

    reset: () => {
        set({
            email: '',
            OTP: '',
            password: '',
            confirmPassword: '',
        });
    },
}));
