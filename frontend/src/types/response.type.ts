import { User } from "./user.types";

export interface APIResponse<T> {
  success: string;
  message: string;
  status?: number;
  data: T;
}
export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}
export interface LogoutResponse {
    message: string;
    success: boolean;
    status?: number;
}


export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface BasePaginationQuery {
  page?: number,
  limit?: number
  sort?: string
  role?: string
}