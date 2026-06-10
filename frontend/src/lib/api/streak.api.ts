import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Streak, CreateStreakInput, UpdateStreakInput } from '@/types/streak.types';

export const streakApi = {
  /** GET /streaks — Lấy streak của user hiện tại (cần đăng nhập) */
  getAll: async () => {
    const res = await axiosInstance.get<APIResponse<Streak[]>>('/streaks');
    return res.data;
  },

  /** POST /streaks — Khởi tạo streak cho user (cần đăng nhập, userId inject từ JWT) */
  create: async (body?: CreateStreakInput) => {
    const res = await axiosInstance.post<APIResponse<Streak>>('/streaks', body ?? {});
    return res.data;
  },

  /** GET /streaks/:id — Lấy chi tiết streak (cần đăng nhập, chỉ record của mình) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Streak>>(`/streaks/${id}`);
    return res.data;
  },

  /** PATCH /streaks/:id — Cập nhật streak (cần đăng nhập, chỉ record của mình) */
  update: async (id: string, body: UpdateStreakInput) => {
    const res = await axiosInstance.patch<APIResponse<Streak>>(`/streaks/${id}`, body);
    return res.data;
  },

  /** DELETE /streaks/:id — Xóa streak (cần đăng nhập, chỉ record của mình) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/streaks/${id}`);
    return res.data;
  },
};
