import { User } from '@/types/user.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setToken: (token: string, refreshToken?: string, user?: User) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
        token: null,
        refreshToken: null,
        user: null,
        setToken: (token: string, refreshToken?: string, user?: User) => 
          set((state) => ({ token, refreshToken: refreshToken || state.refreshToken, user: user || state.user })),
        clearToken: () => set({ token: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);