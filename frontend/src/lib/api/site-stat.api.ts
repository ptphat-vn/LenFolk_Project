import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';

export interface SiteStat {
  _id: string;
  key: string;
  totalVisits: number;
  createdAt: string;
  updatedAt: string;
}

export const siteStatApi = {
  /** GET /site-stats — Lấy thống kê website (Public) */
  getStats: async () => {
    const res = await axiosInstance.get<APIResponse<SiteStat>>('/site-stats');
    return res.data;
  },

  /** POST /site-stats/visit — Ghi nhận 1 lượt truy cập (Public) */
  trackVisit: async () => {
    const res = await axiosInstance.post<APIResponse<SiteStat>>('/site-stats/visit');
    return res.data;
  },
};
