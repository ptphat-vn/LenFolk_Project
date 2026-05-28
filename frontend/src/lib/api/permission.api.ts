import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { Permission, CreatePermissionInput } from "@/types/permission.types";

export const permissionApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<Permission>>(`/permissions`, { params: query });
    return res.data;
  },
  create: async (body: CreatePermissionInput) => {
    const res = await axiosInstance.post<APIResponse<Permission>>(`/permissions`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Permission>>(`/permissions/${id}`);
    return res.data;
  },
  update: async (id: string, body: CreatePermissionInput) => {
    const res = await axiosInstance.patch<APIResponse<Permission>>(`/permissions/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<Permission>>(`/permissions/${id}`);
    return res.data;
  },
};
