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

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

const getAuthToken = (data: AuthResponse) =>
  data.token ?? data.accessToken;

const getRefreshToken = (data: AuthResponse) =>
  data.refreshToken;

export const useRegister = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterPayload) => {
      const response = await axios.post<ApiResponse<AuthResponse>>("/auth/register", {
        name,
        email,
        password,
      });

      return response.data.data;
    },
    onSuccess: (data) => {
      const token = getAuthToken(data);
      const refreshToken = getRefreshToken(data);

      if (data.user && token) {
        setAuth(data.user, token, refreshToken);
      }
    },
  });
};
