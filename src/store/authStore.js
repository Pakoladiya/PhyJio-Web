import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set, get) => ({
    isAuthenticated: false,
    hasPin: false,
    pin: '',
    login: (entered) => {
        if (entered === get().pin) {
            set({ isAuthenticated: true });
            return true;
        }
        return false;
    },
    logout: () => set({ isAuthenticated: false }),
    setPin: (newPin) => {
        set({ pin: newPin, hasPin: true, isAuthenticated: true });
    },
}), { name: 'phyjio-auth' }));
