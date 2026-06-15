import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { PurchaseResponse } from "@/types/payment.type";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PurchasePayload = {
  courseId: string;
  couponCode?: string;
};

export const usePurchaseCourse = () => {
  return useMutation({
    mutationFn: async ({ courseId, couponCode }: PurchasePayload) => {
      const response = await axios.post<ApiResponse<PurchaseResponse>>(
        `/courses/${courseId}/purchase`,
        couponCode ? { couponCode } : {}
      );
      return response.data.data;
    },
  });
};
