import axiosInstance from '../axios';
import { APIResponse } from '@/types/response.type';
import {
  TransactionRecord,
  UpdateTransactionRecordInput,
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

  /** GET /transaction-records/:id — Xem chi tiết giao dịch (cần đăng nhập) */
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<TransactionRecord>>(`/transaction-records/${id}`);
    return res.data;
  },

  /**
   * PATCH /transaction-records/:id — Cập nhật giao dịch (Admin only).
   * SePay xác nhận thanh toán tự động qua webhook — admin chỉ dùng endpoint này
   * để xử lý refund thủ công (set status = refunded).
   */
  update: async (id: string, body: UpdateTransactionRecordInput) => {
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(
      `/transaction-records/${id}`,
      body,
    );
    return res.data;
  },

  /** DELETE /transaction-records/:id — Xóa bản ghi giao dịch (Admin only) */
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<null>>(`/transaction-records/${id}`);
    return res.data;
  },
};
