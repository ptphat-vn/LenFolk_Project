import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  GetNotificationsQuery,
} from '@/types/notification.types';

export const notificationApi = {
  /** GET /notifications — Lấy danh sách thông báo của user hiện tại (cần đăng nhập) */
  getAll: async (query?: GetNotificationsQuery) => {
    const res = await axiosInstance.get<APIResponse<Notification[]>>('/notifications', { params: query });
    return res.data;
  },

  /** POST /notifications — Admin gửi thông báo */
  create: async (body: CreateNotificationInput) => {
    const res = await axiosInstance.post<APIResponse<Notification>>('/notifications', body);
    return res.data;
  },

  /** GET /notifications/:id — Lấy chi tiết thông báo (cần đăng nhập) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Notification>>(`/notifications/${id}`);
    return res.data;
  },

  /** PATCH /notifications/:id — Đánh dấu đã đọc / cập nhật thông báo (cần đăng nhập) */
  update: async (id: string, body: UpdateNotificationInput) => {
    const res = await axiosInstance.patch<APIResponse<Notification>>(`/notifications/${id}`, body);
    return res.data;
  },

  /** DELETE /notifications/:id — Xóa thông báo (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/notifications/${id}`);
    return res.data;
  },
};
