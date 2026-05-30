import axiosInstance from '../axios';
import { LoginForm, RegisterInput, RefreshTokenInput } from '@/types/auth.types';
import { APIResponse, LoginResponse, LogoutResponse, RefreshTokenResponse } from '@/types/response.type';

export const authApi = {
  /** POST /auth/register — Đăng ký tài khoản mới (role mặc định: guest) */
  register: async (data: RegisterInput) => {
    const res = await axiosInstance.post<APIResponse<LoginResponse>>('/auth/register', data);
    return res.data;
  },

  /** POST /auth/login */
  login: async (data: LoginForm) => {
    const res = await axiosInstance.post<APIResponse<LoginResponse>>('/auth/login', data);
    return res.data;
  },

  /** POST /auth/logout — vô hiệu hóa refresh token */
  logout: async (refreshToken: string) => {
    const res = await axiosInstance.post<LogoutResponse>('/auth/logout', { refreshToken } as RefreshTokenInput);
    return res.data;
  },

  /** POST /auth/refresh-token — lấy access token mới */
  refreshToken: async (refreshToken: string) => {
    const res = await axiosInstance.post<APIResponse<RefreshTokenResponse>>(
      '/auth/refresh-token',
      { refreshToken } as RefreshTokenInput,
    );
    return res.data;
  },
};