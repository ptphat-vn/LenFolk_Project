import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  Progress,
  CreateProgressInput,
  UpdateProgressInput,
  GetProgressQuery,
} from '@/types/progress.types';

export const progressApi = {
  /** GET /progress — Lấy danh sách tiến độ của user hiện tại (cần đăng nhập) */
  getAll: async (query?: GetProgressQuery) => {
    const res = await axiosInstance.get<APIResponse<Progress[]>>('/progress', { params: query });
    return res.data;
  },

  /** POST /progress — Ghi nhận/tạo mới tiến độ (cần đăng nhập, userId inject từ JWT) */
  create: async (body: CreateProgressInput) => {
    const res = await axiosInstance.post<APIResponse<Progress>>('/progress', body);
    return res.data;
  },

  /** GET /progress/:id — Lấy chi tiết tiến độ (cần đăng nhập, chỉ record của mình) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Progress>>(`/progress/${id}`);
    return res.data;
  },

  /** PATCH /progress/:id — Cập nhật tiến độ (cần đăng nhập, chỉ record của mình) */
  update: async (id: string, body: UpdateProgressInput) => {
    const res = await axiosInstance.patch<APIResponse<Progress>>(`/progress/${id}`, body);
    return res.data;
  },

  /** DELETE /progress/:id — Xóa bản ghi tiến độ (cần đăng nhập, chỉ record của mình) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/progress/${id}`);
    return res.data;
  },
};
