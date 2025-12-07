import { create } from 'zustand';

interface ILoginStore {
    email: string;
    setEmail: (email: string) => void;

    password: string;
    setPassword: (password: string) => void;

    reset: () => void;
}

export const useLoginStore = create<ILoginStore>((set) => ({
    email: '',
    setEmail: (email) => set({ email }),

    password: '',
    setPassword: (password) => set({ password }),

    reset: () => {
        set({
            email: '',
            password: '',
        });
    },
}));
