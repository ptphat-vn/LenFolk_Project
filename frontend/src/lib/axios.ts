import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call refresh endpoint directly using axios to avoid circular dependency / infinite loop
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken: newAccessToken } = response.data.data;
        
        // Update store with new tokens
        useAuthStore.getState().setToken(newAccessToken, refreshToken);
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state and redirect to login
        useAuthStore.getState().clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
