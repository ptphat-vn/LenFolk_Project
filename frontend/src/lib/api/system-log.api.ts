import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import { AuditLog, CreateAuditLogInput } from '@/types/system-log.types';

export interface GetAuditLogsQuery {
  actorId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const auditLogApi = {
  getAll: async (query?: GetAuditLogsQuery) => {
    const res = await axiosInstance.get<APIResponse<AuditLog[]>>('/audit-logs', {
      params: query,
    });
    return res.data;
  },

  create: async (body: CreateAuditLogInput) => {
    const res = await axiosInstance.post<APIResponse<AuditLog>>('/audit-logs', body);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/audit-logs/${id}`);
    return res.data;
  },
};
