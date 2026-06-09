import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  Performance,
  CreatePerformanceInput,
  GetPerformancesQuery,
  ApprovePerformanceInput,
  RejectPerformanceInput,
} from '@/types/performance.types';
import { CoursePurchaseInput, CoursePurchaseResponse } from '@/types/coupon.types';
import { hasFileValue, toFormData } from './form-data';

function performancePayload(body: Partial<CreatePerformanceInput>) {
  return hasFileValue(body) ? toFormData(body) : body;
}

export const performanceApi = {
  /** GET /performances — Lấy danh sách tiết mục (pending/published/archived cho admin/instructor) */
  getAll: async (query?: GetPerformancesQuery) => {
    const res = await axiosInstance.get<APIResponse<Performance[]>>('/performances', { params: query });
    return res.data;
  },

  /**
   * POST /performances — Tạo tiết mục mới.
   * - Instructor: status tự động = pending, BE tạo Subscription plan nếu có price+billingCycle.
   * - Admin: có thể chỉ định status.
   */
  create: async (body: CreatePerformanceInput) => {
    const res = await axiosInstance.post<APIResponse<Performance>>(
      '/performances',
      performancePayload(body),
    );
    return res.data;
  },

  /** GET /performances/:id — Lấy chi tiết tiết mục (kèm subscription plan nếu có) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Performance>>(`/performances/${id}`);
    return res.data;
  },

  /** PATCH /performances/:id — Cập nhật tiết mục (Instructor không thể đổi status, Admin ok) */
  update: async (id: string, body: Partial<CreatePerformanceInput>) => {
    const res = await axiosInstance.patch<APIResponse<Performance>>(
      `/performances/${id}`,
      performancePayload(body),
    );
    return res.data;
  },

  /** DELETE /performances/:id — Xóa tiết mục (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/performances/${id}`);
    return res.data;
  },

  /** POST /performances/:id/purchase — Mua lẻ tiết mục (User) */
  purchase: async (id: string, body?: CoursePurchaseInput) => {
    const res = await axiosInstance.post<APIResponse<CoursePurchaseResponse>>(
      `/performances/${id}/purchase`,
      body,
    );
    return res.data;
  },

  /**
   * PATCH /performances/:id/approve — Admin duyệt tiết mục (pending → published).
   * Có thể set % hoa hồng trong body.
   */
  approve: async (id: string, body?: ApprovePerformanceInput) => {
    const res = await axiosInstance.patch<APIResponse<Performance>>(
      `/performances/${id}/approve`,
      body,
    );
    return res.data;
  },

  /** PATCH /performances/:id/reject — Admin từ chối tiết mục (pending → archived) */
  reject: async (id: string, body?: RejectPerformanceInput) => {
    const res = await axiosInstance.patch<APIResponse<Performance>>(
      `/performances/${id}/reject`,
      body,
    );
    return res.data;
  },
};
