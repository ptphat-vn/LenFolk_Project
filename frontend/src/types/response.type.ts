import { User } from "./user.types";

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  status?: string;
  results?: number;
  data: T;
}

/** Dùng cho các response trả về mảng có phân trang */
export interface PaginatedResponse<T> {
  success: boolean;
  results: number;
  data: T[];
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
}

export interface BasePaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}