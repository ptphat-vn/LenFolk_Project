import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  AuditLog,
  CreateAuditLogInput,
  ModeratorLog,
  CreateModeratorLogInput,
  ModeratorAction,
} from '@/types/system-log.types';

/** Query params cho GET /audit-logs */
export interface GetAuditLogsQuery {
  actorId?: string;
  action?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/** Query params cho GET /moderator-logs */
export interface GetModeratorLogsQuery {
  moderatorId?: string;
  action?: ModeratorAction;
  page?: number;
  limit?: number;
}

export const auditLogApi = {
  /** GET /audit-logs — Lấy danh sách audit logs (Admin only) */
  getAll: async (query?: GetAuditLogsQuery) => {
    const res = await axiosInstance.get<APIResponse<AuditLog[]>>('/audit-logs', { params: query });
    return res.data;
  },

  /** POST /audit-logs — Tạo audit log (Admin only) */
  create: async (body: CreateAuditLogInput) => {
    const res = await axiosInstance.post<APIResponse<AuditLog>>('/audit-logs', body);
    return res.data;
  },

  /** GET /audit-logs/:id — Lấy chi tiết audit log (Admin only) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data;
  },

  /** DELETE /audit-logs/:id — Xóa audit log (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/audit-logs/${id}`);
    return res.data;
  },
};

export const moderatorLogApi = {
  /** GET /moderator-logs — Lấy danh sách moderator logs (Admin only) */
  getAll: async (query?: GetModeratorLogsQuery) => {
    const res = await axiosInstance.get<APIResponse<ModeratorLog[]>>('/moderator-logs', { params: query });
    return res.data;
  },

  /** POST /moderator-logs — Tạo moderator log (Moderator/Admin) */
  create: async (body: CreateModeratorLogInput) => {
    const res = await axiosInstance.post<APIResponse<ModeratorLog>>('/moderator-logs', body);
    return res.data;
  },

  /** GET /moderator-logs/:id — Lấy chi tiết moderator log */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<ModeratorLog>>(`/moderator-logs/${id}`);
    return res.data;
  },

  /** DELETE /moderator-logs/:id — Xóa moderator log (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/moderator-logs/${id}`);
    return res.data;
  },
};

