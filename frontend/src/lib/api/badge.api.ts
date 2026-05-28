import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Badge, CreateBadgeInput } from "@/types/badge.types";

export const badgeApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Badge>>(`/badges`, { params: query });
    return res.data;
  },
  create: async (body: CreateBadgeInput) => {
    const res = await axiosInstance.post<APIResponse<Badge>>(`/badges`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Badge>>(`/badges/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreateBadgeInput) => {
    const res = await axiosInstance.patch<APIResponse<Badge>>(`/badges/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Badge>>(`/badges/${id}`);
    return res.data;
  },
};
