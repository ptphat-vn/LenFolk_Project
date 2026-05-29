import axios from "axios";
import { API_URL } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Lấy token từ sessionStorage
    const authData = sessionStorage.getItem("authData");
    if (authData) {
      try {
        const parsedAuthData = JSON.parse(authData);
        const token = parsedAuthData.access_token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
        sessionStorage.removeItem("authData");
      }
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
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("authData");
      
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export default instance;
