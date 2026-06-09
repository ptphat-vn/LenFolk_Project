import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Badge, CreateBadgeInput } from '@/types/badge.types';

export const badgeApi = {
  /** GET /badges — Lấy danh sách badge (Public) */
  getAll: async () => {
    const res = await axiosInstance.get<APIResponse<Badge[]>>('/badges');
    return res.data;
  },

  /** POST /badges — Tạo badge mới (Admin only) */
  create: async (body: CreateBadgeInput) => {
    const res = await axiosInstance.post<APIResponse<Badge>>('/badges', body);
    return res.data;
  },

  /** GET /badges/:id — Lấy chi tiết badge (Public) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Badge>>(`/badges/${id}`);
    return res.data;
  },

  /** PATCH /badges/:id — Cập nhật badge (Admin only) */
  update: async (id: string, body: Partial<CreateBadgeInput>) => {
    const res = await axiosInstance.patch<APIResponse<Badge>>(`/badges/${id}`, body);
    return res.data;
  },

  /** DELETE /badges/:id — Xóa badge (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/badges/${id}`);
    return res.data;
  },
};
