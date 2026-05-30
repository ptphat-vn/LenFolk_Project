import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  TransactionRecord,
  CreateTransactionRecordInput,
  UpdateTransactionRecordInput,
  RejectTransactionInput,
  GetTransactionRecordsQuery,
} from '@/types/payment.types';

export const paymentApi = {
  /** GET /transaction-records — Xem danh sách giao dịch (cần đăng nhập) */
  getAll: async (query?: GetTransactionRecordsQuery) => {
    const res = await axiosInstance.get<APIResponse<TransactionRecord[]>>('/transaction-records', {
      params: query,
    });
    return res.data;
  },

  /** POST /transaction-records — Tạo bản ghi giao dịch thủ công (internal/admin) */
  create: async (body: CreateTransactionRecordInput) => {
    const res = await axiosInstance.post<APIResponse<TransactionRecord>>('/transaction-records', body);
    return res.data;
  },

  /** GET /transaction-records/:id — Xem chi tiết giao dịch (cần đăng nhập) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<TransactionRecord>>(`/transaction-records/${id}`);
    return res.data;
  },

  /** PATCH /transaction-records/:id — Cập nhật trạng thái giao dịch (Admin only) */
  update: async (id: string, body: UpdateTransactionRecordInput) => {
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(
      `/transaction-records/${id}`,
      body,
    );
    return res.data;
  },

  /** DELETE /transaction-records/:id — Xóa bản ghi giao dịch (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<void>(`/transaction-records/${id}`);
    return res.data;
  },

  /**
   * PATCH /transaction-records/:id/upload-proof — Upload ảnh chứng minh chuyển khoản (cần đăng nhập)
   * Chuyển status từ pending → reviewing
   */
  uploadProof: async (id: string, proofFile: File) => {
    const formData = new FormData();
    formData.append('proof', proofFile);
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(
      `/transaction-records/${id}/upload-proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  /**
   * PATCH /transaction-records/:id/approve — Admin duyệt giao dịch (Admin only)
   * Chuyển status: reviewing → success, kích hoạt UserSubscription, cập nhật User.role → learner
   */
  approve: async (id: string) => {
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(
      `/transaction-records/${id}/approve`,
    );
    return res.data;
  },

  /**
   * PATCH /transaction-records/:id/reject — Admin từ chối giao dịch (Admin only)
   * Chuyển status: reviewing → failed
   */
  reject: async (id: string, body?: RejectTransactionInput) => {
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(
      `/transaction-records/${id}/reject`,
      body,
    );
    return res.data;
  },
};
