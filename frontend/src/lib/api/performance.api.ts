import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Performance, CreatePerformanceInput, GetPerformancesQuery } from '@/types/performance.types';
import { CoursePurchaseInput, CoursePurchaseResponse } from '@/types/coupon.types';

export const performanceApi = {
  /** GET /performances — Lấy danh sách tiết mục */
  getAll: async (query?: GetPerformancesQuery) => {
    const res = await axiosInstance.get<APIResponse<Performance[]>>('/performances', { params: query });
    return res.data;
  },

  /** POST /performances — Tạo tiết mục mới */
  create: async (body: CreatePerformanceInput) => {
    const res = await axiosInstance.post<APIResponse<Performance>>('/performances', body);
    return res.data;
  },

  /** GET /performances/:id — Lấy chi tiết tiết mục */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Performance>>(`/performances/${id}`);
    return res.data;
  },

  /** PATCH /performances/:id — Cập nhật tiết mục */
  update: async (id: string, body: Partial<CreatePerformanceInput>) => {
    const res = await axiosInstance.patch<APIResponse<Performance>>(`/performances/${id}`, body);
    return res.data;
  },

  /** DELETE /performances/:id — Xóa tiết mục */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/performances/${id}`);
    return res.data;
  },

  /** POST /performances/:id/purchase — Mua lẻ tiết mục */
  purchase: async (id: string, body?: CoursePurchaseInput) => {
    const res = await axiosInstance.post<APIResponse<CoursePurchaseResponse>>(
      `/performances/${id}/purchase`,
      body,
    );
    return res.data;
  },
};
