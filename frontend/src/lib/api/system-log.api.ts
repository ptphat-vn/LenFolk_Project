import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { AuditLog, CreateAuditLogInput, ModeratorLog, CreateModeratorLogInput } from "@/types/system-log.types";

export const systemLogApi = {
  getAllAuditLog: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<AuditLog>>(`/audit-logs`, { params: query });
    return res.data;
  },
  createAuditLog: async (body: CreateAuditLogInput) => {
    const res = await axiosInstance.post<APIResponse<AuditLog>>(`/audit-logs`, body);
    return res.data;
  },
  getByIdAuditLog: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data;
  },
  deleteAuditLog: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<AuditLog>>(`/audit-logs/${id}`);
    return res.data;
  },
  getAllModeratorLog: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<ModeratorLog>>(`/moderator-logs`, { params: query });
    return res.data;
  },
  createModeratorLog: async (body: CreateModeratorLogInput) => {
    const res = await axiosInstance.post<APIResponse<ModeratorLog>>(`/moderator-logs`, body);
    return res.data;
  },
  getByIdModeratorLog: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<ModeratorLog>>(`/moderator-logs/${id}`);
    return res.data;
  },
  deleteModeratorLog: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<ModeratorLog>>(`/moderator-logs/${id}`);
    return res.data;
  },
};
