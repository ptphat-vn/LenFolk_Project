import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { secureStorage } from "@/lib/secure-storage";

export const useLogout = () => {
  const { clearAuth, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const expoPushToken = await secureStorage.getItem("expoPushToken");
      if (expoPushToken) {
        await axios.delete("/push-tokens", { data: { token: expoPushToken } }).catch(() => undefined);
        await secureStorage.removeItem("expoPushToken");
      }
      const response = await axios.post("/auth/logout", {
        refreshToken,
      });

      return response.data;
    },
    onSettled: async () => {
      await clearAuth();
      queryClient.clear();
    },
  });
};
