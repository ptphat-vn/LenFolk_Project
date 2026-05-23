import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string, refreshToken?: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
        token: null,
        refreshToken: null,
        setToken: (token: string, refreshToken?: string) => 
          set((state) => ({ token, refreshToken: refreshToken || state.refreshToken })),
        clearToken: () => set({ token: null, refreshToken: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);