import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types/users.type";

// Lấy base URL từ environment variables
const BASE_URL = API_URL;

// Tạo axios instance
const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

instance.defaults.withCredentials = true;

type AuthResponse = {
  message?: string;
  user?: User;
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type RetriableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

const getAuthToken = (data: AuthResponse) =>
  data.token ?? data.accessToken ?? data.access_token;

const getRefreshToken = (data: AuthResponse) =>
  data.refreshToken ?? data.refresh_token;

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    refreshPromise = axios
      .post<ApiResponse<AuthResponse>>(
        `${BASE_URL}/auth/refresh-token`,
        refreshToken ? { refreshToken } : undefined,
        { withCredentials: true }
      )
      .then(async (response) => {
        const authData = response.data.data;
        const token = getAuthToken(authData);
        const nextRefreshToken = getRefreshToken(authData);

        if (!token) {
          throw new Error("Refresh token response did not include access token");
        }

        if (authData.user) {
          await useAuthStore
            .getState()
            .setAuth(authData.user, token, nextRefreshToken ?? refreshToken ?? undefined);
        } else {
          useAuthStore.setState({
            token,
            refreshToken: nextRefreshToken ?? refreshToken ?? null,
          });
          await AsyncStorage.setItem("token", token);

          if (nextRefreshToken) {
            await AsyncStorage.setItem("refreshToken", nextRefreshToken);
          }
        }

        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as RetriableRequestConfig | undefined;

    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        };

        return instance(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().clearAuth();
        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error(String(refreshError))
        );
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default instance;
