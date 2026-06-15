import { create } from "zustand";
import { secureStorage } from "@/lib/secure-storage";
import { User } from "@/types/users.type";

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updatedFields: Partial<User>) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isCheckingAuth: true,

  setAuth: async (user, token, refreshToken) => {
    set({ user, token, refreshToken: refreshToken ?? null });
    await secureStorage.setItem("user", JSON.stringify(user));
    await secureStorage.setItem("token", token);

    if (refreshToken) {
      await secureStorage.setItem("refreshToken", refreshToken);
    }
  },

  clearAuth: async () => {
    set({ user: null, token: null, refreshToken: null });
    await secureStorage.multiRemove(["user", "token", "refreshToken"]);
  },

  checkAuth: async () => {
    try {
      const [user, token, refreshToken] = await Promise.all([
        secureStorage.getItem("user"),
        secureStorage.getItem("token"),
        secureStorage.getItem("refreshToken"),
      ]);

      if (user && token) {
        set({ user: JSON.parse(user), token, refreshToken });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  updateUser: async (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const mergedUser = { ...state.user, ...updatedFields };
      secureStorage.setItem("user", JSON.stringify(mergedUser)).catch(console.error);
      return { user: mergedUser };
    });
  },
}));
