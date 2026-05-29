import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Notification, CreateNotificationInput } from "@/types/notification.types";

export const notificationApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Notification>>(`/notifications`, { params: query });
    return res.data;
  },
  create: async (body: CreateNotificationInput) => {
    const res = await axiosInstance.post<APIResponse<Notification>>(`/notifications`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Notification>>(`/notifications/${id}`);
    return res.data;
  },
  update: async (id: string, body: object) => {
    const res = await axiosInstance.patch<APIResponse<Notification>>(`/notifications/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Notification>>(`/notifications/${id}`);
    return res.data;
  },
};
