import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { Permission, CreatePermissionInput } from '@/types/permission.types';

export const permissionApi = {
  /** GET /permissions — Lấy danh sách permissions (Admin only) */
  getAll: async () => {
    const res = await axiosInstance.get<APIResponse<Permission[]>>('/permissions');
    return res.data;
  },

  /** POST /permissions — Tạo permission mới (Admin only) */
  create: async (body: CreatePermissionInput) => {
    const res = await axiosInstance.post<APIResponse<Permission>>('/permissions', body);
    return res.data;
  },

  /** GET /permissions/:id — Lấy chi tiết permission (Admin only) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<Permission>>(`/permissions/${id}`);
    return res.data;
  },

  /** PATCH /permissions/:id — Cập nhật permission (Admin only) */
  update: async (id: string, body: Partial<CreatePermissionInput>) => {
    const res = await axiosInstance.patch<APIResponse<Permission>>(`/permissions/${id}`, body);
    return res.data;
  },

  /** DELETE /permissions/:id — Xóa permission (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/permissions/${id}`);
    return res.data;
  },
};
