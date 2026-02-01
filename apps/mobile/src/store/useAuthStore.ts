import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

interface User {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    bio?: string;
    followers_count?: number;
    following_count?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                setAuthToken(token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                setAuthToken(null);
                set({ user: null, token: null, isAuthenticated: false });
            },
            updateUser: (updatedFields) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null
                })),
        }),
        {
            name: 'gipjazes-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    setAuthToken(state.token);
                }
            },
        }
    )
);
