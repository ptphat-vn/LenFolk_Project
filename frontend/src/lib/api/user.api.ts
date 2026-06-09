import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { User, CreateUserInput, UpdateUserInput, GetUsersQuery } from '@/types/user.types';

export const userApi = {
  /** GET /users — Lấy danh sách user (Admin only) */
  getUsers: async (query?: GetUsersQuery) => {
    const res = await axiosInstance.get<APIResponse<User[]>>('/users', { params: query });
    return res.data;
  },

  /** POST /users — Admin tạo user mới */
  createUser: async (body: CreateUserInput) => {
    const res = await axiosInstance.post<APIResponse<User>>('/users', body);
    return res.data;
  },

  /** GET /users/:id — Lấy thông tin user theo ID (Admin only) */
  getUserById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<User>>(`/users/${id}`);
    return res.data;
  },

  /** PATCH /users/:id — Cập nhật user (Admin only, hỗ trợ upload avatar qua multipart/form-data) */
  updateUser: async (id: string, body: UpdateUserInput) => {
    // Nếu có file avatar, dùng FormData
    if (body.avatar instanceof File) {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value as string | Blob);
        }
      });
      const res = await axiosInstance.patch<APIResponse<User>>(`/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    }

    const res = await axiosInstance.patch<APIResponse<User>>(`/users/${id}`, body);
    return res.data;
  },

  /** DELETE /users/:id — Soft-delete user (Admin only) */
  deleteUser: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/users/${id}`);
    return res.data;
  },
};
