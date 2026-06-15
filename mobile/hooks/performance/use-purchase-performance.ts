import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { PurchaseResponse } from "@/types/payment.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PurchasePerformancePayload = {
  performanceId: string;
  couponCode?: string;
};

export const usePurchasePerformance = () => {
  return useMutation({
    mutationFn: async ({ performanceId, couponCode }: PurchasePerformancePayload) => {
      const response = await axios.post<ApiResponse<PurchaseResponse>>(
        `/performances/${performanceId}/purchase`,
        couponCode ? { couponCode } : {}
      );
      return response.data.data;
    },
  });
};
