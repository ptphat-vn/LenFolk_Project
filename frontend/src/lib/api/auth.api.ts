import { LoginForm } from "@/types/auth.types";
import axiosInstance from "../axios"
import { APIResponse, LoginResponse, LogoutResponse, RefreshTokenResponse } from "@/types/response.type";


export const authApi = {
    login: async (data: LoginForm) => {
        const response = await axiosInstance.post<APIResponse<LoginResponse>>('/auth/login', data);
        return response.data;
    },

    logout: async (refreshToken: string) => {
        const response = await axiosInstance.post<APIResponse<LogoutResponse>>('/auth/logout', { refreshToken });
        return response.data;
    },
    refreshToken: async (refreshToken: string) => {
        const res = await axiosInstance.post<APIResponse<RefreshTokenResponse>>('/auth/refresh-token', { refreshToken });
        return res.data;
    }
}