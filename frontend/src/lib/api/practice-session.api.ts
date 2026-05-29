import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  PracticeSession,
  CreatePracticeSessionInput,
  UpdatePracticeSessionInput,
  GetPracticeSessionsQuery,
} from '@/types/practice-session.types';

export const practiceSessionApi = {
  /** GET /practice-sessions — Lấy danh sách phiên luyện tập của user hiện tại (cần đăng nhập) */
  getAll: async (query?: GetPracticeSessionsQuery) => {
    const res = await axiosInstance.get<APIResponse<PracticeSession[]>>('/practice-sessions', {
      params: query,
    });
    return res.data;
  },

  /** POST /practice-sessions — Bắt đầu phiên luyện tập mới (cần đăng nhập) */
  create: async (body: CreatePracticeSessionInput) => {
    const res = await axiosInstance.post<APIResponse<PracticeSession>>('/practice-sessions', body);
    return res.data;
  },

  /** GET /practice-sessions/:id — Lấy chi tiết phiên luyện tập (cần đăng nhập, chỉ session của mình) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<PracticeSession>>(`/practice-sessions/${id}`);
    return res.data;
  },

  /** PATCH /practice-sessions/:id — Cập nhật phiên luyện tập (chỉ audioFileUrl, referenceAudio, duration) */
  update: async (id: string, body: UpdatePracticeSessionInput) => {
    const res = await axiosInstance.patch<APIResponse<PracticeSession>>(`/practice-sessions/${id}`, body);
    return res.data;
  },

  /** DELETE /practice-sessions/:id — Xóa phiên luyện tập (cần đăng nhập, chỉ session của mình) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/practice-sessions/${id}`);
    return res.data;
  },
};
