import { APIResponse, BasePaginationQuery } from "@/types/response.type";
import axiosInstance from "../axios";
import { TransactionRecord, ZaloPayCreateOrderInput, ZaloPayCallbackInput } from "@/types/payment.types";

export const paymentApi = {
  getAll: async (query?: BasePaginationQuery) => {
    const res = await axiosInstance.get<APIResponse<TransactionRecord>>(`/transaction-records`, { params: query });
    return res.data;
  },
  create: async (body: object) => {
    const res = await axiosInstance.post<APIResponse<TransactionRecord>>(`/transaction-records`, body);
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get<APIResponse<TransactionRecord>>(`/transaction-records/${id}`);
    return res.data;
  },
  update: async (id: string, body: object) => {
    const res = await axiosInstance.patch<APIResponse<TransactionRecord>>(`/transaction-records/${id}`, body);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete<APIResponse<TransactionRecord>>(`/transaction-records/${id}`);
    return res.data;
  },
  createZaloPayOrder: async (body: ZaloPayCreateOrderInput) => {
    const res = await axiosInstance.post<APIResponse<object>>(`/payments/zalopay/create-order`, body);
    return res.data;
  },
  createZaloPayCallback: async (body: ZaloPayCallbackInput) => {
    const res = await axiosInstance.post<APIResponse<object>>(`/payments/zalopay/callback`, body);
    return res.data;
  },
  checkZaloPayStatus: async (body: object) => {
    const res = await axiosInstance.post<APIResponse<object>>(`/payments/zalopay/check-status`, body);
    return res.data;
  },
};
