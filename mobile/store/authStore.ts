import { create } from "zustand";
import { secureStorage } from "@/lib/secure-storage";
import { User } from "@/types/users.type";
import { API_URL } from "@/constants/api";

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

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const useAuthStore = create<AuthState>((set, get) => ({
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
      const [storedUser, token, refreshToken] = await Promise.all([
        secureStorage.getItem("user"),
        secureStorage.getItem("token"),
        secureStorage.getItem("refreshToken"),
      ]);

      if (storedUser && token) {
        const cachedUser = JSON.parse(storedUser) as User;
        set({ user: cachedUser, token, refreshToken });

        try {
          const response = await fetch(API_URL + "/users/me", {
            headers: { Authorization: "Bearer " + token },
          });

          if (response.ok) {
            const body = (await response.json()) as ApiResponse<User>;
            if (body.data) {
              set({ user: body.data });
              await secureStorage.setItem("user", JSON.stringify(body.data));
            }
          }
        } catch (error) {
          console.warn("Không thể đồng bộ người dùng khi khởi động", error);
        }
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  updateUser: async (updatedFields) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const mergedUser = { ...currentUser, ...updatedFields };
    set({ user: mergedUser });
    await secureStorage.setItem("user", JSON.stringify(mergedUser));
  },
}));
