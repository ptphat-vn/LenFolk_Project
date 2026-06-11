import { User } from '@/types/user.types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  /** true sau khi persist khôi phục xong từ localStorage (tránh redirect sớm) */
  hasHydrated: boolean;
  setToken: (token: string, refreshToken?: string, user?: User) => void;
  clearToken: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setToken: (token: string, refreshToken?: string, user?: User) =>
        set((state) => ({
          token,
          refreshToken: refreshToken || state.refreshToken,
          user: user || state.user,
        })),
      // Xóa toàn bộ phiên đăng nhập (kể cả user)
      clearToken: () => set({ token: null, refreshToken: null, user: null }),
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu dữ liệu phiên, không lưu cờ hydrate
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
