import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  Subscription,
  CreateSubscriptionInput,
  RequestSubscriptionResponse,
} from '@/types/subscription.types';

export const subscriptionApi = {
  /** GET /subscriptions — Xem danh sách gói đăng ký (Public, chỉ trả gói isActive: true) */
  getAll: async () => {
    const res = await axiosInstance.get<APIResponse<Subscription[]>>('/subscriptions');
    return res.data;
  },

  /** POST /subscriptions — Tạo gói đăng ký mới (Admin only) */
  create: async (body: CreateSubscriptionInput) => {
    const res = await axiosInstance.post<APIResponse<Subscription>>('/subscriptions', body);
    return res.data;
  },

  /** GET /subscriptions/:id — Xem chi tiết gói đăng ký (Public) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Subscription>>(`/subscriptions/${id}`);
    return res.data;
  },

  /** PATCH /subscriptions/:id — Cập nhật gói đăng ký (Admin only) */
  update: async (id: string, body: Partial<CreateSubscriptionInput>) => {
    const res = await axiosInstance.patch<APIResponse<Subscription>>(`/subscriptions/${id}`, body);
    return res.data;
  },

  /** DELETE /subscriptions/:id — Xóa gói đăng ký (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/subscriptions/${id}`);
    return res.data;
  },

  /**
   * POST /subscriptions/:id/request — Yêu cầu mua gói (cần đăng nhập)
   * Tạo UserSubscription (pending) + TransactionRecord + trả về qrCodeUrl
   */
  requestSubscription: async (id: string) => {
    const res = await axiosInstance.post<APIResponse<RequestSubscriptionResponse>>(
      `/subscriptions/${id}/request`,
    );
    return res.data;
  },
};
