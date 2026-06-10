import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/setup/axios";

export const useLogout = () => {
  const { clearAuth, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
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
