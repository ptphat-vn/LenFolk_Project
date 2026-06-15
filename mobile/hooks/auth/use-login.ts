import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import axios from "@/setup/axios";
import { User } from "@/types/users.type";

type AuthResponse = {
  message?: string;
  user?: User;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type LoginPayload = {
  email: string;
  password: string;
};

const getAuthToken = (data: AuthResponse) =>
  data.token ?? data.accessToken;

const getRefreshToken = (data: AuthResponse) =>
  data.refreshToken;

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const response = await axios.post<ApiResponse<AuthResponse>>("/auth/login", {
        email,
        password,
      });

      return response.data.data;
    },
    onSuccess: async (data) => {
      const token = getAuthToken(data);
      const refreshToken = getRefreshToken(data);

      if (data.user && token) {
        await setAuth(data.user, token, refreshToken);
      }
    },
  });
};
