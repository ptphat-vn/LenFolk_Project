import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionRecord } from "@/types/transaction-records.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PurchasePerformancePayload = {
  performanceId: string;
  paymentMethod: string;
  couponCode?: string;
};

export const usePurchasePerformance = () => {
  return useMutation({
    mutationFn: async ({ performanceId, paymentMethod, couponCode }: PurchasePerformancePayload) => {
      const response = await axios.post<ApiResponse<TransactionRecord>>(
        `/performances/${performanceId}/purchase`,
        { paymentMethod, couponCode }
      );
      return response.data.data;
    },
  });
};
