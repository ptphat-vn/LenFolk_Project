import { useMutation } from "@tanstack/react-query";
import axios from "@/setup/axios";
import { TransactionRecord } from "@/types/transaction-records.type";

export type PurchaseResponse = {
  message: string;
  transactionId: string;
  qrCodeUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferNote?: string;
  originalAmount: number;
  discountAmount: number;
  amountToPay: number;
  currency: string;
  courseName: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type PurchasePayload = {
  courseId: string;
  paymentMethod: string;
  couponCode?: string;
};

export const usePurchaseCourse = () => {
  return useMutation({
    mutationFn: async ({ courseId, paymentMethod, couponCode }: PurchasePayload) => {
      const response = await axios.post<ApiResponse<PurchaseResponse>>(
        `/courses/${courseId}/purchase`,
        { paymentMethod, couponCode }
      );
      return response.data.data;
    },
  });
};
